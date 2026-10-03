/**
 * Python Offline Fallback Interpreter
 * Safely parses and executes standard Python code for syllabus problems
 * (Two Pointers, Prefix Sum, Binary Search, HashMap, 2D Array)
 * used when Pyodide WebAssembly is unavailable or offline.
 */

export interface FallbackResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function executePythonFallback(code: string, stdin: string = ''): FallbackResult {
  const output: string[] = [];
  const errors: string[] = [];
  const stdinLines = stdin.split('\n');
  let stdinIndex = 0;

  function fakeInput(): string {
    if (stdinIndex < stdinLines.length) {
      return stdinLines[stdinIndex++];
    }
    return '';
  }

  // Pre-process standard Python patterns to runnable JavaScript inside an isolated function
  try {
    let jsCode = code;

    // Normalize Windows line endings
    jsCode = jsCode.replace(/\r\n/g, '\n');

    // Handle common Python idioms (Compound expressions handled first)
    // 1. Compound: list(map(int, input().split()))
    jsCode = jsCode.replace(/list\s*\(\s*map\s*\(\s*int\s*,\s*input\(\)\.split\(\)\s*\)\s*\)/g, 
      '(__fake_input__().trim().split(/\\s+/).filter(Boolean).map(x => parseInt(x, 10)))');

    // 2. Compound: int(input())
    jsCode = jsCode.replace(/int\s*\(\s*input\(\)\s*\)/g, 'parseInt(__fake_input__().trim(), 10)');

    // 3. General list(map(int, expr.split()))
    jsCode = jsCode.replace(/list\s*\(\s*map\s*\(\s*int\s*,\s*([^)]+)\.split\(\)\s*\)\s*\)/g, 
      '($1.trim().split(/\\s+/).filter(Boolean).map(x => parseInt(x, 10)))');

    // 4. General input() -> __fake_input__()
    jsCode = jsCode.replace(/\binput\(\)/g, '__fake_input__()');

    // 5. print(...) -> __fake_print__(...)
    jsCode = jsCode.replace(/\bprint\s*\(/g, '__fake_print__(');

    // 6. int(...) -> parseInt(..., 10)
    jsCode = jsCode.replace(/\bint\s*\(([^)]+)\)/g, 'parseInt($1, 10)');

    // 7. len(...) -> (...).length
    jsCode = jsCode.replace(/\blen\s*\(([^)]+)\)/g, '($1).length');

    // 8. True / False / None -> true / false / null
    jsCode = jsCode.replace(/\bTrue\b/g, 'true');
    jsCode = jsCode.replace(/\bFalse\b/g, 'false');
    jsCode = jsCode.replace(/\bNone\b/g, 'null');

    // 9. and / or / not -> && / || / !
    jsCode = jsCode.replace(/\band\b/g, '&&');
    jsCode = jsCode.replace(/\bor\b/g, '||');
    jsCode = jsCode.replace(/\bnot\s+/g, '!');

    // 8. Convert simple indentation-based blocks to JS braces if needed, or run in JS sandbox
    // For pure JS transpiled parts, create sandbox context
    const sandboxScope: Record<string, any> = {
      __fake_input__: fakeInput,
      __fake_print__: (...args: any[]) => {
        output.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
      range: (start: number, stop?: number, step: number = 1) => {
        const res: number[] = [];
        let s = start;
        let e = stop;
        if (e === undefined) {
          e = s;
          s = 0;
        }
        for (let i = s; step > 0 ? i < e : i > e; i += step) {
          res.push(i);
        }
        return res;
      },
      sum: (arr: number[]) => (Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0),
      min: (...args: any[]) => {
        const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return Math.min(...flat);
      },
      max: (...args: any[]) => {
        const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return Math.max(...flat);
      },
      abs: Math.abs,
    };

    // If code has basic Python syntax like colons and def/while/for:
    // Convert Python indentation to JS blocks
    const lines = jsCode.split('\n');
    const convertedLines: string[] = [];
    const indentStack: number[] = [0];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const indent = line.search(/\S/);
      while (indent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
        convertedLines.push('}');
      }

      // Check if line ends with colon
      if (trimmed.endsWith(':')) {
        const header = trimmed.slice(0, -1).trim();
        indentStack.push(indent + 4);

        if (header.startsWith('def ')) {
          convertedLines.push(header.replace('def ', 'function ') + ' {');
        } else if (header.startsWith('if ')) {
          convertedLines.push(header.replace(/^if\s+(.*)$/, 'if ($1) {'));
        } else if (header.startsWith('elif ')) {
          convertedLines.push(header.replace(/^elif\s+(.*)$/, 'else if ($1) {'));
        } else if (header === 'else') {
          convertedLines.push('else {');
        } else if (header.startsWith('while ')) {
          convertedLines.push(header.replace(/^while\s+(.*)$/, 'while ($1) {'));
        } else if (header.startsWith('for ')) {
          const match = header.match(/^for\s+([a-zA-Z_0-9]+)\s+in\s+range\((.*)\)$/);
          if (match) {
            const varName = match[1];
            const rangeArgs = match[2];
            convertedLines.push(`for (let ${varName} of range(${rangeArgs})) {`);
          } else {
            const forInMatch = header.match(/^for\s+([a-zA-Z_0-9]+)\s+in\s+(.*)$/);
            if (forInMatch) {
              convertedLines.push(`for (let ${forInMatch[1]} of ${forInMatch[2]}) {`);
            } else {
              convertedLines.push(header + ' {');
            }
          }
        } else {
          convertedLines.push(header + ' {');
        }
      } else {
        // Variable declaration heuristic (assigning without let/const/var)
        if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*/.test(trimmed) && !trimmed.startsWith('let ') && !trimmed.startsWith('const ')) {
          convertedLines.push('var ' + trimmed + ';');
        } else {
          convertedLines.push(trimmed + ';');
        }
      }
    }

    while (indentStack.length > 1) {
      indentStack.pop();
      convertedLines.push('}');
    }

    const finalJs = convertedLines.join('\n');
    const runner = new Function(...Object.keys(sandboxScope), finalJs);
    runner(...Object.values(sandboxScope));

    return {
      stdout: output.join('\n'),
      stderr: '',
      exitCode: 0,
    };
  } catch (err: any) {
    return {
      stdout: output.join('\n'),
      stderr: String(err?.message || err),
      exitCode: 1,
    };
  }
}
