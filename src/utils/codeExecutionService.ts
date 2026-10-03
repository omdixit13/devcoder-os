import type { LanguageConfig, SupportedLanguage, ExecutionResult, LanguageStatus } from '../types/codingLab';
import { executePythonFallback } from './pythonFallbackInterpreter';

// ===== Language Configurations =====
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  python: {
    id: 'python',
    name: 'Python',
    extension: '.py',
    monacoLang: 'python',
    commands: {
      check: ['python', '--version'],
      compile: null,
      run: ['python', '$FILE'],
    },
    template: `# Read input\nn = int(input())\narr = list(map(int, input().split()))\n\n# Your solution here\nresult = sum(arr)\n\n# Print output\nprint(result)\n`,
    commentPrefix: '#',
  },
  java: {
    id: 'java',
    name: 'Java',
    extension: '.java',
    monacoLang: 'java',
    commands: {
      check: ['java', '--version'],
      compile: ['javac', '$FILE'],
      run: ['java', '-cp', '$FILE/../', 'solution'],
    },
    template: `import java.util.Scanner;\n\npublic class solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        \n        // Your solution here\n        int result = 0;\n        for (int x : arr) result += x;\n        \n        System.out.println(result);\n    }\n}\n`,
    commentPrefix: '//',
  },
  c: {
    id: 'c',
    name: 'C',
    extension: '.c',
    monacoLang: 'c',
    commands: {
      check: ['gcc', '--version'],
      compile: ['gcc', '-o', '$OUT', '$FILE', '-lm'],
      run: ['$OUT'],
    },
    template: `#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);\n    \n    // Your solution here\n    int result = 0;\n    for (int i = 0; i < n; i++) result += arr[i];\n    \n    printf("%d\\n", result);\n    return 0;\n}\n`,
    commentPrefix: '//',
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    extension: '.cpp',
    monacoLang: 'cpp',
    commands: {
      check: ['g++', '--version'],
      compile: ['g++', '-o', '$OUT', '$FILE', '-std=c++17'],
      run: ['$OUT'],
    },
    template: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    \n    // Your solution here\n    long long result = 0;\n    for (int x : arr) result += x;\n    \n    cout << result << endl;\n    return 0;\n}\n`,
    commentPrefix: '//',
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extension: '.js',
    monacoLang: 'javascript',
    commands: {
      check: ['node', '--version'],
      compile: null,
      run: ['node', '$FILE'],
    },
    template: `const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\n\nrl.on('line', (line) => lines.push(line.trim()));\nrl.on('close', () => {\n    const n = parseInt(lines[0]);\n    const arr = lines[1].split(' ').map(Number);\n    \n    // Your solution here\n    const result = arr.reduce((a, b) => a + b, 0);\n    \n    console.log(result);\n});\n`,
    commentPrefix: '//',
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    extension: '.ts',
    monacoLang: 'typescript',
    commands: {
      check: ['npx', 'tsc', '--version'],
      compile: null,
      run: ['npx', 'tsx', '$FILE'],
    },
    template: `import * as readline from 'readline';\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines: string[] = [];\n\nrl.on('line', (line: string) => lines.push(line.trim()));\nrl.on('close', () => {\n    const n: number = parseInt(lines[0]);\n    const arr: number[] = lines[1].split(' ').map(Number);\n    \n    // Your solution here\n    const result: number = arr.reduce((a, b) => a + b, 0);\n    \n    console.log(result);\n});\n`,
    commentPrefix: '//',
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    extension: '.sql',
    monacoLang: 'sql',
    commands: {
      check: ['sqlite3', '--version'],
      compile: null,
      run: ['sqlite3', ':memory:', '-cmd', '.read $FILE'],
    },
    template: `-- Create sample table\nCREATE TABLE users (\n    id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    age INTEGER\n);\n\nINSERT INTO users VALUES (1, 'Alice', 25);\nINSERT INTO users VALUES (2, 'Bob', 30);\nINSERT INTO users VALUES (3, 'Charlie', 22);\n\n-- Your query here\nSELECT * FROM users WHERE age > 23;\n`,
    commentPrefix: '--',
  },
};

// ===== Diagnostics & Health Check State (Spec Section 12) =====
export interface ExecutionDiagnostics {
  pythonRuntime: 'READY' | 'INITIALIZING' | 'ERROR' | 'FALLBACK';
  workerStatus: 'READY' | 'INITIALIZING' | 'ERROR';
  environment: 'Browser' | 'Electron';
  lastExecution: {
    timestamp: string;
    language: string;
    status: string;
    executionTimeMs: number;
    error?: string;
  } | null;
}

const diagnosticsState: ExecutionDiagnostics = {
  pythonRuntime: typeof window !== 'undefined' && (window as any).electronAPI ? 'READY' : 'READY',
  workerStatus: 'READY',
  environment: typeof window !== 'undefined' && (window as any).electronAPI ? 'Electron' : 'Browser',
  lastExecution: null,
};

export function getExecutionEngineStatus(): ExecutionDiagnostics {
  return { ...diagnosticsState };
}

// ===== Web Worker Python Execution (Pyodide WebAssembly) =====
let pythonWorker: Worker | null = null;
let pythonWorkerReady = false;
let pythonWorkerInitPromise: Promise<boolean> | null = null;

export function initPythonWorker(): Promise<boolean> {
  if (pythonWorkerReady && pythonWorker) return Promise.resolve(true);
  if (pythonWorkerInitPromise) return pythonWorkerInitPromise;

  pythonWorkerInitPromise = new Promise((resolve) => {
    try {
      diagnosticsState.pythonRuntime = 'INITIALIZING';
      diagnosticsState.workerStatus = 'INITIALIZING';

      const worker = new Worker('/python-worker.js');
      pythonWorker = worker;

      const timeout = setTimeout(() => {
        console.warn('Pyodide Worker init timeout; falling back to internal Python interpreter.');
        diagnosticsState.pythonRuntime = 'FALLBACK';
        resolve(false);
      }, 10000);

      worker.onmessage = (e) => {
        if (e.data?.type === 'init_success') {
          clearTimeout(timeout);
          pythonWorkerReady = true;
          diagnosticsState.pythonRuntime = 'READY';
          diagnosticsState.workerStatus = 'READY';
          resolve(true);
        } else if (e.data?.type === 'init_error') {
          clearTimeout(timeout);
          pythonWorkerReady = false;
          diagnosticsState.pythonRuntime = 'FALLBACK';
          diagnosticsState.workerStatus = 'ERROR';
          resolve(false);
        }
      };

      worker.onerror = (err) => {
        clearTimeout(timeout);
        pythonWorkerReady = false;
        diagnosticsState.pythonRuntime = 'FALLBACK';
        diagnosticsState.workerStatus = 'ERROR';
        console.warn('Pyodide Worker load error:', err);
        resolve(false);
      };

      worker.postMessage({ type: 'init' });
    } catch (err) {
      pythonWorkerReady = false;
      diagnosticsState.pythonRuntime = 'FALLBACK';
      diagnosticsState.workerStatus = 'ERROR';
      resolve(false);
    }
  });

  return pythonWorkerInitPromise;
}

// Automatically start pre-warming Python worker in background
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initPythonWorker().catch(() => {});
  }, 100);
}

async function executePythonInWorker(code: string, stdin: string, timeoutMs: number = 10000): Promise<ExecutionResult> {
  const isReady = await initPythonWorker();

  // Primary Path: Pyodide WebAssembly in Web Worker
  if (isReady && pythonWorker) {
    const currentWorker = pythonWorker;
    return new Promise((resolve) => {
      const execId = `py_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const startTime = Date.now();

      const timeoutTimer = setTimeout(() => {
        // Terminate worker on infinite loop / TLE
        currentWorker.terminate();
        pythonWorker = null;
        pythonWorkerReady = false;
        pythonWorkerInitPromise = null;
        resolve({
          status: 'time_limit',
          stdout: '',
          stderr: `Execution timed out (${timeoutMs / 1000}s limit) — Time Limit Exceeded (TLE).\nPlease check for infinite loops or non-terminating while conditions.`,
          exitCode: null,
          executionTimeMs: Date.now() - startTime,
        });
      }, timeoutMs);

      const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === 'execute_result' && e.data?.id === execId) {
          clearTimeout(timeoutTimer);
          currentWorker.removeEventListener('message', handleMessage);
          resolve({
            status: e.data.status,
            stdout: e.data.stdout || '',
            stderr: e.data.stderr || '',
            exitCode: e.data.exitCode,
            executionTimeMs: e.data.executionTimeMs || (Date.now() - startTime),
          });
        }
      };

      currentWorker.addEventListener('message', handleMessage);
      currentWorker.postMessage({
        type: 'execute',
        id: execId,
        code,
        stdin,
      });
    });
  }

  // Secondary Path: Reliable Offline Fallback Interpreter
  const startTime = Date.now();
  const fbResult = executePythonFallback(code, stdin);
  const executionTimeMs = Date.now() - startTime;

  let status: 'passed' | 'runtime_error' | 'compilation_error' = 'passed';
  if (fbResult.exitCode !== 0 || fbResult.stderr) {
    status = fbResult.stderr.includes('SyntaxError') ? 'compilation_error' : 'runtime_error';
  }

  return {
    status,
    stdout: fbResult.stdout,
    stderr: fbResult.stderr,
    exitCode: fbResult.exitCode,
    executionTimeMs,
  };
}

// ===== Web Worker JavaScript/TypeScript Sandbox =====
function executeInWebWorker(code: string, stdin: string): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const workerCode = `
      const originalConsoleLog = console.log;
      const output = [];
      console.log = (...args) => output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));

      // Mock readline for stdin
      const stdinLines = ${JSON.stringify(stdin.split('\n'))};
      let lineIndex = 0;
      const readline = { 
        createInterface: () => ({
          on: function(event, cb) { 
            if (event === 'line') { stdinLines.forEach(l => cb(l)); }
            if (event === 'close') { setTimeout(() => cb(), 0); }
            return this;
          }
        })
      };
      const require = (mod) => { if (mod === 'readline') return readline; return {}; };
      const process = { stdin: { read: () => null } };

      try {
        ${code}
        setTimeout(() => {
          self.postMessage({ status: 'passed', stdout: output.join('\\n'), stderr: '', exitCode: 0 });
        }, 100);
      } catch(e) {
        self.postMessage({ status: 'runtime_error', stdout: output.join('\\n'), stderr: e.message, exitCode: 1 });
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const startTime = Date.now();

    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        status: 'time_limit',
        stdout: '',
        stderr: 'Execution timed out (10s limit)',
        exitCode: null,
        executionTimeMs: Date.now() - startTime,
      });
    }, 10000);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        ...e.data,
        executionTimeMs: Date.now() - startTime,
      });
    };

    worker.onerror = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        status: 'runtime_error',
        stdout: '',
        stderr: e.message || 'Worker error',
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
      });
    };
  });
}

// ===== Main Execution Function =====
export async function executeCode(
  code: string,
  language: SupportedLanguage,
  stdin: string = ''
): Promise<ExecutionResult> {
  const config = LANGUAGE_CONFIGS[language];
  if (!config) {
    return {
      status: 'runtime_error',
      stdout: '',
      stderr: `Unsupported language: ${language}`,
      exitCode: 1,
      executionTimeMs: 0,
    };
  }

  // Strategy A: Electron IPC (Real native host runtime if running in Electron)
  if (typeof window !== 'undefined' && (window as any).electronAPI?.executeCode) {
    try {
      const result = await (window as any).electronAPI.executeCode({
        code,
        language,
        stdin,
        timeoutMs: 6000,
      });
      diagnosticsState.lastExecution = {
        timestamp: new Date().toISOString(),
        language,
        status: result.status,
        executionTimeMs: result.executionTimeMs || 0,
        error: result.stderr || undefined,
      };
      return result as ExecutionResult;
    } catch (err) {
      console.warn('Electron executeCode failed, falling back to browser execution:', err);
    }
  }

  // Strategy B: Real Python Execution via Pyodide WebAssembly Web Worker (Netlify / Web Mode)
  if (language === 'python') {
    const res = await executePythonInWorker(code, stdin);
    diagnosticsState.lastExecution = {
      timestamp: new Date().toISOString(),
      language: 'python',
      status: res.status,
      executionTimeMs: res.executionTimeMs || 0,
      error: res.stderr || undefined,
    };
    return res;
  }

  // Strategy C: Web Worker sandbox (JS/TS)
  if (language === 'javascript' || language === 'typescript') {
    const res = await executeInWebWorker(code, stdin);
    diagnosticsState.lastExecution = {
      timestamp: new Date().toISOString(),
      language,
      status: res.status,
      executionTimeMs: res.executionTimeMs || 0,
      error: res.stderr || undefined,
    };
    return res;
  }

  // Strategy D: Other compiled languages in pure web mode
  return {
    status: 'runtime_error',
    stdout: '',
    stderr: `${config.name} compiler is native-only.\nPython, JavaScript, and TypeScript execute natively in web mode.\nTo compile ${config.name}, run DevCareer OS in Desktop mode or select Python for instant browser execution.`,
    exitCode: 1,
    executionTimeMs: 0,
  };
}

// ===== Language Detection =====
export async function checkLanguageInstalled(language: SupportedLanguage): Promise<LanguageStatus> {
  const config = LANGUAGE_CONFIGS[language];
  if (!config) {
    return { language, installed: false };
  }

  if (typeof window !== 'undefined' && (window as any).electronAPI?.checkLanguage) {
    try {
      const result = await (window as any).electronAPI.checkLanguage(language);
      if (result) {
        return {
          language,
          installed: result.installed,
          version: result.version || undefined,
          lastChecked: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Language check failed:', err);
    }
  }

  // In web mode, Python (via Pyodide WebAssembly) and JS/TS are ready
  if (language === 'python') {
    return {
      language: 'python',
      installed: true,
      version: 'Pyodide WebAssembly (CPython 3.12)',
      lastChecked: new Date().toISOString(),
    };
  }

  if (language === 'javascript' || language === 'typescript') {
    return {
      language,
      installed: true,
      version: 'Web Worker sandbox',
      lastChecked: new Date().toISOString(),
    };
  }

  return { language, installed: false, lastChecked: new Date().toISOString() };
}
