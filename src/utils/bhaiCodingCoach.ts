import type { CodingProblem, ExecutionResult, CodingAttempt, ProblemDifficulty } from '../types/codingLab';

export interface BhaiCoachFeedback {
  type: 'insight' | 'warning' | 'error_help' | 'hint' | 'edge_case' | 'praise';
  headline: string;
  message: string;
  actionLabel?: string;
  actionTarget?: string;
}

/**
 * Analyzes code for complexity bottlenecks against problem constraints
 */
export function analyzeCodeComplexity(
  code: string,
  problem: CodingProblem
): BhaiCoachFeedback | null {
  if (!code || code.trim().length < 20) return null;

  const normalized = code.toLowerCase();

  // Detect nested loops
  const pythonNestedLoops = /(for|while)\s+.*:[\s\S]*?(for|while)\s+.*:/.test(normalized);
  const cLikeNestedLoops = /(for|while)\s*\([^)]*\)\s*\{[\s\S]*?(for|while)\s*\([^)]*\)/.test(normalized);
  const hasNestedLoops = pythonNestedLoops || cLikeNestedLoops;

  // Check problem constraints for 10^4 or 10^5
  const isLargeConstraint = problem.constraints.some(c => 
    c.includes('10⁴') || c.includes('10⁵') || c.includes('10^4') || c.includes('10^5') || c.includes('10000') || c.includes('100000')
  );

  if (hasNestedLoops && isLargeConstraint && problem.timeComplexity?.includes('O(n)')) {
    return {
      type: 'warning',
      headline: 'Constraints thoda dhyan se dekhiye!',
      message: `Aapke code me nested loops dikh rahe hain (O(n²)). Lekin yahan constraints n ≤ 10⁵ tak hain. 10⁵ ka square 10¹⁰ operations banata hai jo 1 second me Time Limit Exceeded (TLE) dega! Kya hum kisi data structure (jaise Hash Map ya Two Pointers) se lookup ko O(1) kar sakte hain?`,
    };
  }

  // Detect recursion without memoization in DP problems
  if (problem.topics.includes('Dynamic Programming')) {
    const hasRecursion = (normalized.includes('def ') || normalized.includes('function ')) && 
      /\b([a-zA-Z0-9_]+)\s*\([\s\S]*?\1\s*\(/.test(normalized);
    const hasMemo = normalized.includes('memo') || normalized.includes('dp') || normalized.includes('cache') || normalized.includes('@lru_cache');
    if (hasRecursion && !hasMemo) {
      return {
        type: 'warning',
        headline: 'Exponential Call Tree Warning',
        message: `Bhai ne notice kiya ki aap pure recursion use kar rahe hain bina memoization ke. Isse duplicate subproblems baar-baar recalculate honge (O(2ⁿ)). Ek memo dictionary ya 1D array banake results store karke dekhiye!`,
      };
    }
  }

  return null;
}

/**
 * Explains compiler or runtime errors with friendly, actionable guidance
 */
export function analyzeExecutionFailure(
  result: ExecutionResult,
  problem: CodingProblem
): BhaiCoachFeedback {
  const { status, stderr, compilationError } = result;

  if (status === 'compilation_error') {
    const errText = compilationError || stderr || '';
    if (errText.includes('SyntaxError')) {
      return {
        type: 'error_help',
        headline: 'Syntax Error pakda gaya!',
        message: `Code me syntax mistake hai — koi parenthesis \`()\`, colon \`:\`, ya bracket band karna miss ho gaya hai. Error line number check kijiye.`,
      };
    }
    if (errText.includes('was not declared in this scope') || errText.includes('cannot find symbol')) {
      return {
        type: 'error_help',
        headline: 'Variable Declaration Missing',
        message: `Compiler keh raha hai ki koi variable use karne se pehle declare nahi hua, ya typo hai. Spelling verify kijiye!`,
      };
    }
    return {
      type: 'error_help',
      headline: 'Compilation Error',
      message: `Compiler ne code reject kar diya. Error console me red color se highlighted line check kijiye aur fix kijiye.`,
    };
  }

  if (status === 'time_limit') {
    return {
      type: 'warning',
      headline: 'Time Limit Exceeded (TLE)!',
      message: `Aapka solution 6 seconds se zyada le raha hai. Ya toh while-loop me index increment hona miss ho gaya hai (infinite loop), ya algorithm ki time complexity problem ke constraints ke hisaab se zyada heavy hai.`,
    };
  }

  if (status === 'runtime_error') {
    const errText = stderr || '';
    if (errText.includes('IndexError') || errText.includes('ArrayIndexOutOfBoundsException') || errText.includes('out of range')) {
      return {
        type: 'error_help',
        headline: 'Index Out of Range!',
        message: `Array ki boundary se bahar access karne ki koshish hui hai. Loop conditions check kijiye (\`i < n\` vs \`i <= n\`), ya empty array check lagaiye.`,
      };
    }
    if (errText.includes('ZeroDivisionError') || errText.includes('/ by zero')) {
      return {
        type: 'error_help',
        headline: 'Division by Zero!',
        message: `Kisi step par denominator 0 ban raha hai. Edge case check kijiye jab value zero ho sakti hai.`,
      };
    }
    if (errText.includes('KeyError')) {
      return {
        type: 'error_help',
        headline: 'Missing Key in Map/Dict!',
        message: `Dictionary me aisi key access karne ki koshish ho rahi hai jo exist nahi karti. Pehle \`if key in dict\` ya \`.get()\` use kijiye.`,
      };
    }
    return {
      type: 'error_help',
      headline: 'Runtime Exception',
      message: `Execution ke dauran crash hua. Stderr output check karke line trace kijiye.`,
    };
  }

  if (status === 'wrong_answer') {
    return {
      type: 'edge_case',
      headline: 'Wrong Answer — Edge Cases sochiye',
      message: `Code run ho raha hai lekin expected output se match nahi kiya. Kya aapne:
1. Negative numbers handle kiye?
2. Array with 1 or 2 elements check kiya?
3. Duplicates handle kiye?
Input aur Expected Output compare kijiye.`,
    };
  }

  return {
    type: 'insight',
    headline: 'Bhai Coding Coach',
    message: `Apna approach implement kijiye. Agar kahi fasein toh Hint lene me koi sharm nahi — step by step seekhna hi asli growth hai!`,
  };
}

/**
 * Checks for repeated mistakes on a topic and suggests roadmap intervention
 */
export function checkRepeatedMistakes(
  attempts: CodingAttempt[],
  currentProblem: CodingProblem
): { hasPattern: boolean; topic: string; failCount: number; message: string } | null {
  if (!attempts || attempts.length < 3) return null;

  for (const topic of currentProblem.topics) {
    const recentTopicAttempts = attempts
      .filter(a => a.topics.includes(topic))
      .slice(0, 5);

    const failCount = recentTopicAttempts.filter(a => a.status !== 'passed').length;

    if (failCount >= 3) {
      return {
        hasPattern: true,
        topic,
        failCount,
        message: `Bhai noticed a pattern: ${topic} is currently causing repeated mistakes (${failCount} recent failed attempts). Ek baar is concept ko fundamentally revise kar lein toh aage ke saare problems bahut aasaan ho jayenge!`,
      };
    }
  }

  return null;
}

/**
 * Formats hints progressively:
 * Level 1: Direction
 * Level 2: Key Observation
 * Level 3: Approach
 * Level 4: Pseudocode
 * Solution: Only when explicitly requested
 */
export function getStructuredHint(problem: CodingProblem, level: number): {
  levelTitle: string;
  content: string;
} | null {
  const hints = problem.structuredHints || {
    direction: problem.hints[0] || 'Think about the problem constraints and what data structure helps.',
    keyObservation: problem.hints[1] || 'Notice the relationship between the inputs and optimal subproblems.',
    approach: problem.hints[2] || problem.solutionApproach || 'Use standard algorithmic reduction.',
    pseudocode: problem.hints[3] || 'Initialize pointers/structures -> loop through elements -> update state -> return result.',
    fullSolution: undefined,
  };

  switch (level) {
    case 1:
      return { levelTitle: 'Hint 1: Direction (Kaise Shuru Karein)', content: hints.direction };
    case 2:
      return { levelTitle: 'Hint 2: Key Observation (Asli Trick)', content: hints.keyObservation };
    case 3:
      return { levelTitle: 'Hint 3: Approach (Algorithmic Strategy)', content: hints.approach };
    case 4:
      return { levelTitle: 'Hint 4: Pseudocode (Step-by-Step Logic)', content: hints.pseudocode };
    default:
      return null;
  }
}
