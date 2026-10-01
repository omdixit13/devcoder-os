// ===== Coding Lab Types =====

export type SupportedLanguage = 'python' | 'java' | 'c' | 'cpp' | 'javascript' | 'typescript' | 'sql';

export type ExecutionStatus = 
  | 'idle' | 'running' | 'passed' | 'wrong_answer' 
  | 'compilation_error' | 'runtime_error' | 'time_limit' | 'memory_limit';

export type CodingLabMode = 'learning' | 'contest';

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export type MistakeCategory = 'syntax' | 'logic' | 'tle' | 'runtime' | 'edge_case' | 'accepted';

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  extension: string;
  monacoLang: string;
  commands: {
    check: string[];
    compile: string[] | null;
    run: string[];
  };
  template: string;
  commentPrefix: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isCustom?: boolean;
  isHidden?: boolean; // Hidden test cases for SUBMIT judging
}

export interface TestResult {
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTimeMs: number;
  error?: string;
  isHidden?: boolean;
}

export interface ExecutionResult {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number;
  compilationError?: string;
  testResults?: TestResult[];
  runType?: 'run' | 'submit';
}

export interface StructuredHints {
  direction: string;        // HINT 1: General direction
  keyObservation: string;   // HINT 2: Mathematical / structural insight
  approach: string;         // HINT 3: Algorithm & data structure
  pseudocode: string;       // HINT 4: Step-by-step logic
  fullSolution?: string;    // Only when explicitly requested
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  topics: string[];
  hints: string[];
  structuredHints?: StructuredHints;
  testCases: TestCase[];
  solutionApproach?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  starterCode: Partial<Record<SupportedLanguage, string>>;
  solutionCode?: Partial<Record<SupportedLanguage, string>>;
  relatedConcepts: string[]; // link to Learning concepts
}

export interface CodingAttempt {
  id: string;
  problemId: string;
  problemTitle: string;
  difficulty: ProblemDifficulty;
  topics: string[];
  language: SupportedLanguage;
  code: string;
  status: ExecutionStatus;
  timestamp: string;
  executionTimeMs?: number;
  testsPassed?: number;
  testsTotal?: number;
  runType: 'run' | 'submit';
  mistakeCategory: MistakeCategory;
}

export interface VirtualContest {
  id: string;
  title: string;
  durationMinutes: number;
  problemIds: string[];
  startedAt: string;
  endedAt?: string;
  score: number;
  results: {
    problemId: string;
    solved: boolean;
    attempts: number;
    timeToSolveMs?: number;
    score: number;
  }[];
}

export interface VirtualContestDebrief {
  contestId: string;
  title: string;
  totalTimeSeconds: number;
  solvedCount: number;
  attemptedCount: number;
  totalProblems: number;
  totalScore: number;
  weakTopics: string[];
  mistakesSummary: Record<string, number>;
  recommendedRevision: {
    topic: string;
    conceptId: string;
    reason: string;
  }[];
}

export interface LanguageStatus {
  language: SupportedLanguage;
  installed: boolean;
  version?: string;
  path?: string;
  lastChecked?: string;
}

export interface ProblemRecommendation {
  problem: CodingProblem;
  reason: string;
  confidence: number;
  focusTopic: string;
}
