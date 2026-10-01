import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SupportedLanguage, ExecutionStatus, CodingLabMode,
  CodingProblem, CodingAttempt, LanguageStatus, TestCase, TestResult, ExecutionResult,
  MistakeCategory, VirtualContest, VirtualContestDebrief, ProblemRecommendation,
} from '../types/codingLab';
import { codingProblems } from '../data/codingLabProblems';
import { LANGUAGE_CONFIGS, executeCode, checkLanguageInstalled } from '../utils/codeExecutionService';
import { soundManager } from '../utils/soundManager';
import { getRecommendedNextProblem } from '../utils/problemRecommendationService';

interface CodingLabState {
  // Problem selection
  problems: CodingProblem[];
  selectedProblemId: string | null;
  selectedProblem: CodingProblem | null;
  selectProblem: (id: string) => void;

  // Editor
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  editorCode: string;
  setEditorCode: (code: string) => void;
  savedDrafts: Record<string, Record<string, string>>; // problemId -> language -> code

  // Execution (Separate RUN vs SUBMIT)
  executionStatus: ExecutionStatus;
  executionResult: ExecutionResult | null;
  isExecuting: boolean;
  customInput: string;
  setCustomInput: (input: string) => void;
  runCode: (stdin?: string) => Promise<void>;
  submitCode: () => Promise<void>;
  stopExecution: () => void;
  testResults: TestResult[];

  // Mode
  mode: CodingLabMode;
  setMode: (mode: CodingLabMode) => void;

  // Contest Timer & Scoring
  contestTimerSeconds: number;
  isContestTimerRunning: boolean;
  startContestTimer: (minutes: number) => void;
  stopContestTimer: () => void;
  tickContestTimer: () => void;

  // Virtual Contest
  activeVirtualContest: VirtualContest | null;
  virtualContestDebrief: VirtualContestDebrief | null;
  startVirtualContest: (minutes: number) => void;
  finishVirtualContest: () => void;
  dismissDebrief: () => void;

  // Progressive Hints & Solution
  currentHintLevel: number;
  isSolutionRevealed: boolean;
  revealNextHint: () => void;
  revealSolution: () => void;
  resetHints: () => void;

  // Attempt history & comparison
  attempts: CodingAttempt[];
  compareAttempt: CodingAttempt | null;
  setCompareAttempt: (attempt: CodingAttempt | null) => void;
  restoreAttemptCode: (code: string) => void;

  // Language detection
  languageStatuses: LanguageStatus[];
  checkAllLanguages: () => Promise<void>;
  checkSingleLanguage: (lang: SupportedLanguage) => Promise<void>;

  // Console
  consoleTab: 'output' | 'testcases' | 'hidden_tests' | 'custom' | 'history';
  setConsoleTab: (tab: 'output' | 'testcases' | 'hidden_tests' | 'custom' | 'history') => void;

  // Filters & Search
  topicFilter: string;
  difficultyFilter: string;
  setTopicFilter: (f: string) => void;
  setDifficultyFilter: (f: string) => void;

  // Active view
  labView: 'home' | 'problem';
  setLabView: (v: 'home' | 'problem') => void;

  // Recommendation
  getRecommendation: () => ProblemRecommendation;
}

export const useCodingLabStore = create<CodingLabState>()(
  persist(
    (set, get) => ({
      // Problems
      problems: codingProblems,
      selectedProblemId: null,
      selectedProblem: null,
      selectProblem: (id) => {
        const problem = codingProblems.find(p => p.id === id) || null;
        const lang = get().currentLanguage;
        const saved = get().savedDrafts[id]?.[lang];
        const starterCode = problem?.starterCode[lang] || LANGUAGE_CONFIGS[lang]?.template || '';
        set({
          selectedProblemId: id,
          selectedProblem: problem,
          editorCode: saved || starterCode,
          executionStatus: 'idle',
          executionResult: null,
          testResults: [],
          currentHintLevel: 0,
          isSolutionRevealed: false,
          labView: 'problem',
          consoleTab: 'output',
          compareAttempt: null,
        });
        soundManager.play('navigation');
      },

      // Editor
      currentLanguage: 'python',
      setLanguage: (lang) => {
        const problemId = get().selectedProblemId;
        const problem = get().selectedProblem;
        // Save current code as draft
        if (problemId) {
          const currentLang = get().currentLanguage;
          const currentCode = get().editorCode;
          set(state => ({
            savedDrafts: {
              ...state.savedDrafts,
              [problemId]: {
                ...state.savedDrafts[problemId],
                [currentLang]: currentCode,
              },
            },
          }));
        }
        // Load saved draft or starter code for new language
        const saved = problemId ? get().savedDrafts[problemId]?.[lang] : undefined;
        const starterCode = problem?.starterCode[lang] || LANGUAGE_CONFIGS[lang]?.template || '';
        set({
          currentLanguage: lang,
          editorCode: saved || starterCode,
          executionStatus: 'idle',
          executionResult: null,
          testResults: [],
        });
      },
      editorCode: LANGUAGE_CONFIGS.python.template,
      setEditorCode: (code) => {
        const problemId = get().selectedProblemId;
        const lang = get().currentLanguage;
        set(state => ({
          editorCode: code,
          savedDrafts: problemId ? {
            ...state.savedDrafts,
            [problemId]: {
              ...state.savedDrafts[problemId],
              [lang]: code,
            },
          } : state.savedDrafts,
        }));
      },
      savedDrafts: {},

      // Execution
      executionStatus: 'idle',
      executionResult: null,
      isExecuting: false,
      customInput: '',
      setCustomInput: (input) => set({ customInput: input }),

      // RUN: Runs custom stdin OR all visible test cases
      runCode: async (stdin) => {
        const { editorCode, currentLanguage, customInput, selectedProblem } = get();
        soundManager.play('click');

        // Case 1: Custom stdin provided or user entered custom input
        if (stdin !== undefined || customInput.trim()) {
          const input = stdin ?? customInput;
          set({ isExecuting: true, executionStatus: 'running', executionResult: null, consoleTab: 'output' });
          try {
            const result = await executeCode(editorCode, currentLanguage, input);
            const status = result.status as ExecutionStatus;
            set({
              isExecuting: false,
              executionStatus: status,
              executionResult: { ...result, runType: 'run' },
            });
            if (status === 'passed') soundManager.play('taskCompleted');
            else soundManager.play('error');
          } catch (err) {
            set({
              isExecuting: false,
              executionStatus: 'runtime_error',
              executionResult: {
                status: 'runtime_error',
                stdout: '',
                stderr: (err as Error).message || 'Execution failed',
                exitCode: 1,
                executionTimeMs: 0,
                runType: 'run',
              },
            });
            soundManager.play('error');
          }
          return;
        }

        // Case 2: Run against visible test cases
        if (!selectedProblem) return;
        const visibleTests = selectedProblem.testCases.filter(tc => !tc.isHidden);
        set({ isExecuting: true, executionStatus: 'running', testResults: [], consoleTab: 'testcases' });

        const results: TestResult[] = [];
        let allPassed = true;

        for (const tc of visibleTests) {
          try {
            const res = await executeCode(editorCode, currentLanguage, tc.input);
            const actual = res.stdout.trim();
            const expected = tc.expectedOutput.trim();
            const passed = actual === expected && res.status === 'passed';
            if (!passed) allPassed = false;
            results.push({
              testCaseId: tc.id,
              input: tc.input,
              expectedOutput: expected,
              actualOutput: actual,
              passed,
              executionTimeMs: res.executionTimeMs,
              error: res.stderr || undefined,
              isHidden: false,
            });
          } catch (err) {
            allPassed = false;
            results.push({
              testCaseId: tc.id,
              input: tc.input,
              expectedOutput: tc.expectedOutput.trim(),
              actualOutput: '',
              passed: false,
              executionTimeMs: 0,
              error: (err as Error).message,
              isHidden: false,
            });
          }
        }

        const finalStatus: ExecutionStatus = allPassed ? 'passed' : 'wrong_answer';
        set({
          isExecuting: false,
          executionStatus: finalStatus,
          testResults: results,
          executionResult: {
            status: finalStatus,
            stdout: results.map(r => r.actualOutput).join('\n'),
            stderr: '',
            exitCode: allPassed ? 0 : 1,
            executionTimeMs: results.reduce((acc, r) => acc + r.executionTimeMs, 0),
            testResults: results,
            runType: 'run',
          },
        });

        if (allPassed) soundManager.play('taskCompleted');
        else soundManager.play('error');
      },

      // SUBMIT: Runs against ALL test cases (both visible and hidden) for real judging
      submitCode: async () => {
        const { editorCode, currentLanguage, selectedProblem } = get();
        if (!selectedProblem) return;

        set({ isExecuting: true, executionStatus: 'running', testResults: [], consoleTab: 'testcases' });
        soundManager.play('click');

        const allTests = selectedProblem.testCases;
        const results: TestResult[] = [];
        let allPassed = true;
        let compilationFailed = false;
        let timedOut = false;
        let runtimeCrashed = false;
        let firstFailureError = '';

        for (const tc of allTests) {
          try {
            const res = await executeCode(editorCode, currentLanguage, tc.input);
            if (res.status === 'compilation_error') {
              compilationFailed = true;
              allPassed = false;
              firstFailureError = res.compilationError || res.stderr || 'Compilation error';
              break;
            }
            if (res.status === 'time_limit') {
              timedOut = true;
              allPassed = false;
              firstFailureError = 'Time Limit Exceeded';
              break;
            }
            if (res.status === 'runtime_error') {
              runtimeCrashed = true;
              allPassed = false;
              firstFailureError = res.stderr || 'Runtime error';
              break;
            }

            const actual = res.stdout.trim();
            const expected = tc.expectedOutput.trim();
            const passed = actual === expected;
            if (!passed) allPassed = false;

            results.push({
              testCaseId: tc.id,
              input: tc.input,
              expectedOutput: expected,
              actualOutput: actual,
              passed,
              executionTimeMs: res.executionTimeMs,
              error: res.stderr || undefined,
              isHidden: tc.isHidden,
            });

            // Stop on first failure in hidden tests to match LeetCode judging
            if (!passed && tc.isHidden) {
              break;
            }
          } catch (err) {
            allPassed = false;
            runtimeCrashed = true;
            firstFailureError = (err as Error).message;
            break;
          }
        }

        let finalStatus: ExecutionStatus = 'passed';
        let mistakeCategory: MistakeCategory = 'accepted';

        if (compilationFailed) {
          finalStatus = 'compilation_error';
          mistakeCategory = 'syntax';
        } else if (timedOut) {
          finalStatus = 'time_limit';
          mistakeCategory = 'tle';
        } else if (runtimeCrashed) {
          finalStatus = 'runtime_error';
          mistakeCategory = 'runtime';
        } else if (!allPassed) {
          finalStatus = 'wrong_answer';
          mistakeCategory = 'logic';
        }

        const totalExecutionTime = results.reduce((acc, r) => acc + r.executionTimeMs, 0);

        set({
          isExecuting: false,
          executionStatus: finalStatus,
          testResults: results,
          executionResult: {
            status: finalStatus,
            stdout: results.map(r => r.actualOutput).join('\n'),
            stderr: firstFailureError,
            exitCode: allPassed ? 0 : 1,
            executionTimeMs: totalExecutionTime,
            testResults: results,
            compilationError: compilationFailed ? firstFailureError : undefined,
            runType: 'submit',
          },
        });

        if (allPassed) {
          soundManager.play('milestone');
        } else {
          soundManager.play('error');
        }

        // Record Attempt in history
        const attempt: CodingAttempt = {
          id: `attempt-${Date.now()}`,
          problemId: selectedProblem.id,
          problemTitle: selectedProblem.title,
          difficulty: selectedProblem.difficulty,
          topics: selectedProblem.topics,
          language: currentLanguage,
          code: editorCode,
          status: finalStatus,
          timestamp: new Date().toISOString(),
          executionTimeMs: totalExecutionTime,
          testsPassed: results.filter(r => r.passed).length,
          testsTotal: allTests.length,
          runType: 'submit',
          mistakeCategory,
        };

        set(state => ({
          attempts: [attempt, ...state.attempts].slice(0, 300),
        }));

        // If in virtual contest, update contest score
        const { activeVirtualContest } = get();
        if (activeVirtualContest) {
          const problemScore = allPassed ? (selectedProblem.difficulty === 'Easy' ? 100 : selectedProblem.difficulty === 'Medium' ? 200 : 300) : 0;
          set(state => ({
            activeVirtualContest: state.activeVirtualContest ? {
              ...state.activeVirtualContest,
              score: state.activeVirtualContest.score + (allPassed ? problemScore : 0),
              results: [
                ...state.activeVirtualContest.results.filter(r => r.problemId !== selectedProblem.id),
                {
                  problemId: selectedProblem.id,
                  solved: allPassed,
                  attempts: (state.activeVirtualContest.results.find(r => r.problemId === selectedProblem.id)?.attempts || 0) + 1,
                  score: problemScore,
                },
              ],
            } : null,
          }));
        }
      },

      stopExecution: () => {
        if (window.electronAPI?.killProcess) {
          window.electronAPI.killProcess();
        }
        set({ isExecuting: false, executionStatus: 'idle' });
      },
      testResults: [],

      // Mode
      mode: 'learning',
      setMode: (mode) => {
        if (mode === 'contest') {
          // In contest mode, reset hints and collapse spoilers
          set({ mode, currentHintLevel: 0, isSolutionRevealed: false });
        } else {
          set({ mode });
        }
      },

      // Contest Timer
      contestTimerSeconds: 0,
      isContestTimerRunning: false,
      startContestTimer: (minutes) => {
        set({
          contestTimerSeconds: minutes * 60,
          isContestTimerRunning: true,
          mode: 'contest',
          currentHintLevel: 0,
          isSolutionRevealed: false,
        });
      },
      stopContestTimer: () => {
        set({ isContestTimerRunning: false });
      },
      tickContestTimer: () => {
        const { contestTimerSeconds, isContestTimerRunning } = get();
        if (!isContestTimerRunning) return;
        if (contestTimerSeconds <= 1) {
          set({ contestTimerSeconds: 0, isContestTimerRunning: false });
          soundManager.play('error');
        } else {
          set({ contestTimerSeconds: contestTimerSeconds - 1 });
        }
      },

      // Virtual Contest
      activeVirtualContest: null,
      virtualContestDebrief: null,
      startVirtualContest: (durationMinutes) => {
        // Select 3 diverse problems: 1 Easy, 1 Medium, 1 other
        const easyP = codingProblems.find(p => p.difficulty === 'Easy') || codingProblems[0];
        const medP1 = codingProblems.find(p => p.difficulty === 'Medium') || codingProblems[1];
        const medP2 = codingProblems.find(p => p.id !== easyP.id && p.id !== medP1.id) || codingProblems[2];
        const contestProblemIds = [easyP.id, medP1.id, medP2.id];

        const contest: VirtualContest = {
          id: `vc-${Date.now()}`,
          title: `Virtual Contest (${durationMinutes}m)`,
          durationMinutes,
          problemIds: contestProblemIds,
          startedAt: new Date().toISOString(),
          score: 0,
          results: contestProblemIds.map(pId => ({
            problemId: pId,
            solved: false,
            attempts: 0,
            score: 0,
          })),
        };

        set({
          activeVirtualContest: contest,
          mode: 'contest',
          currentHintLevel: 0,
          isSolutionRevealed: false,
        });

        get().selectProblem(contestProblemIds[0]);
        get().startContestTimer(durationMinutes);
      },

      finishVirtualContest: () => {
        const { activeVirtualContest, contestTimerSeconds, attempts } = get();
        if (!activeVirtualContest) return;

        const totalTimeSeconds = activeVirtualContest.durationMinutes * 60 - contestTimerSeconds;
        const solvedCount = activeVirtualContest.results.filter(r => r.solved).length;
        const totalScore = activeVirtualContest.results.reduce((acc, r) => acc + r.score, 0);

        // Analyze mistakes & weak topics from this session
        const weakTopicsSet = new Set<string>();
        const mistakesMap: Record<string, number> = {};

        for (const r of activeVirtualContest.results) {
          const prob = codingProblems.find(p => p.id === r.problemId);
          if (prob && !r.solved) {
            prob.topics.forEach(t => weakTopicsSet.add(t));
          }
        }

        const debrief: VirtualContestDebrief = {
          contestId: activeVirtualContest.id,
          title: activeVirtualContest.title,
          totalTimeSeconds,
          solvedCount,
          attemptedCount: activeVirtualContest.results.filter(r => r.attempts > 0).length,
          totalProblems: activeVirtualContest.problemIds.length,
          totalScore,
          weakTopics: Array.from(weakTopicsSet),
          mistakesSummary: mistakesMap,
          recommendedRevision: Array.from(weakTopicsSet).map(topic => ({
            topic,
            conceptId: topic.toLowerCase().replace(/\s+/g, '-'),
            reason: `Virtual contest me ${topic} topic ke test cases me mistake aayi.`,
          })),
        };

        set({
          activeVirtualContest: null,
          isContestTimerRunning: false,
          mode: 'learning',
          virtualContestDebrief: debrief,
        });

        soundManager.play('milestone');
      },

      dismissDebrief: () => set({ virtualContestDebrief: null }),

      // Hints
      currentHintLevel: 0,
      isSolutionRevealed: false,
      revealNextHint: () => {
        const { currentHintLevel, mode } = get();
        if (mode === 'contest') return; // Enforce contest rule
        if (currentHintLevel < 4) {
          soundManager.play('click');
          set({ currentHintLevel: currentHintLevel + 1 });
        }
      },
      revealSolution: () => {
        const { mode } = get();
        if (mode === 'contest') return; // Enforce contest rule
        soundManager.play('click');
        set({ isSolutionRevealed: true });
      },
      resetHints: () => set({ currentHintLevel: 0, isSolutionRevealed: false }),

      // Attempts & Comparison
      attempts: [],
      compareAttempt: null,
      setCompareAttempt: (attempt) => set({ compareAttempt: attempt }),
      restoreAttemptCode: (code) => {
        soundManager.play('click');
        set({ editorCode: code });
      },

      // Language detection
      languageStatuses: [],
      checkAllLanguages: async () => {
        const languages: SupportedLanguage[] = ['python', 'cpp', 'javascript', 'java', 'c', 'typescript'];
        const statuses: LanguageStatus[] = [];
        for (const lang of languages) {
          const status = await checkLanguageInstalled(lang);
          statuses.push(status);
        }
        set({ languageStatuses: statuses });
      },
      checkSingleLanguage: async (lang) => {
        const status = await checkLanguageInstalled(lang);
        set(state => ({
          languageStatuses: [
            ...state.languageStatuses.filter(s => s.language !== lang),
            status,
          ],
        }));
      },

      // Console
      consoleTab: 'output',
      setConsoleTab: (tab) => set({ consoleTab: tab }),

      // Filters
      topicFilter: 'All',
      difficultyFilter: 'All',
      setTopicFilter: (f) => set({ topicFilter: f }),
      setDifficultyFilter: (f) => set({ difficultyFilter: f }),

      // Active view
      labView: 'home',
      setLabView: (v) => set({ labView: v }),

      // Recommendation
      getRecommendation: () => {
        const { attempts } = get();
        return getRecommendedNextProblem({ attempts });
      },
    }),
    {
      name: 'devcareer_coding_lab',
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        savedDrafts: state.savedDrafts,
        attempts: state.attempts.slice(0, 100),
        languageStatuses: state.languageStatuses,
        mode: state.mode,
      }),
    }
  )
);
