import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play, Square, RotateCcw, ChevronRight, Terminal, CheckCircle2,
  XCircle, Clock, AlertTriangle, Lightbulb, Code2, ArrowLeft,
  BookOpen, Zap, Timer, FileCode, ChevronDown, Send, Cpu,
  Sparkles, ShieldAlert, Compass, RefreshCw, Trophy, Flag, Eye,
  Lock, ArrowUpRight, HelpCircle, Layers, Check, Copy, Flame,
  ExternalLink, Plus, Trash2
} from 'lucide-react';
import { useCodingLabStore } from '../store/useCodingLabStore';
import { useAppStore } from '../store/useAppStore';
import { LANGUAGE_CONFIGS, executeCode } from '../utils/codeExecutionService';
import type { SupportedLanguage, ProblemDifficulty, CodingAttempt, TestCase } from '../types/codingLab';
import { soundManager } from '../utils/soundManager';
import {
  analyzeCodeComplexity,
  analyzeExecutionFailure,
  checkRepeatedMistakes,
  getStructuredHint,
} from '../utils/bhaiCodingCoach';
import { getContextualCodeSuggestion, type CodeSuggestionMode } from '../utils/codeSuggestionService';
import CustomTestCaseBuilder from '../components/codingLab/CustomTestCaseBuilder';
import CodingEngineDiagnosticsModal from '../components/codingLab/CodingEngineDiagnosticsModal';
import { getMentorAddress, formatOmHintIntro, formatOmErrorFeedback, isRidhimaProfile } from '../utils/mentorPersonalization';
import { authService } from '../services/authService';

// ===== Difficulty Badge =====
const diffColors: Record<ProblemDifficulty, { bg: string; text: string }> = {
  Easy: { bg: 'bg-accent-green/10', text: 'text-accent-green' },
  Medium: { bg: 'bg-accent-yellow/10', text: 'text-accent-yellow' },
  Hard: { bg: 'bg-accent-red/10', text: 'text-accent-red' },
};

function DiffBadge({ d }: { d: ProblemDifficulty }) {
  return (
    <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${diffColors[d].bg} ${diffColors[d].text}`}>
      {d}
    </span>
  );
}

// ===== Status Icon =====
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'passed': return <CheckCircle2 size={14} className="text-accent-green" />;
    case 'wrong_answer': return <XCircle size={14} className="text-accent-red" />;
    case 'compilation_error': return <AlertTriangle size={14} className="text-accent-yellow" />;
    case 'runtime_error': return <Zap size={14} className="text-accent-red" />;
    case 'time_limit': return <Clock size={14} className="text-accent-yellow" />;
    case 'running': return <div className="w-3.5 h-3.5 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />;
    default: return null;
  }
}

const statusLabels: Record<string, string> = {
  idle: 'Ready',
  running: 'Executing in sandbox...',
  passed: 'Accepted',
  wrong_answer: 'Wrong Answer',
  compilation_error: 'Compilation Error',
  runtime_error: 'Runtime Error',
  time_limit: 'Time Limit Exceeded',
  memory_limit: 'Memory Limit Exceeded',
};

// ===== Coding Lab Home =====
function CodingLabHome() {
  const {
    problems, selectProblem, attempts,
    sourceFilter, setSourceFilter,
    topicFilter, difficultyFilter, setTopicFilter, setDifficultyFilter,
    startVirtualContest, getRecommendation,
  } = useCodingLabStore();

  const [search, setSearch] = useState('');
  const [showContestModal, setShowContestModal] = useState(false);
  const [contestDuration, setContestDuration] = useState(60);

  const recommendation = useMemo(() => getRecommendation(), [attempts]);

  const sirsProblems = useMemo(() => problems.filter(p => p.source === 'SIR_SHEET'), [problems]);
  const sirsCount = sirsProblems.length;

  const allTopics = useMemo(() => {
    const topicSet = new Set<string>();
    problems.forEach(p => p.topics.forEach(t => topicSet.add(t)));
    return ['All', ...Array.from(topicSet).sort()];
  }, [problems]);

  const filtered = useMemo(() => {
    let result = [...problems];

    // Source Filter
    if (sourceFilter === 'SIR_SHEET') {
      result = result.filter(p => p.source === 'SIR_SHEET');
      // Sort strictly by authoritative source order 1..29
      result.sort((a, b) => (a.sourceOrder || 0) - (b.sourceOrder || 0));
    } else if (sourceFilter === 'CORE') {
      result = result.filter(p => p.source !== 'SIR_SHEET');
    }

    if (topicFilter !== 'All') result = result.filter(p => p.topics.includes(topicFilter));
    if (difficultyFilter !== 'All') result = result.filter(p => p.difficulty === difficultyFilter);

    // Global Search: searches title, topic, platform, and URL
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.topics.some(t => t.toLowerCase().includes(q)) ||
        (p.platform && p.platform.toLowerCase().includes(q)) ||
        (p.platformUrl && p.platformUrl.toLowerCase().includes(q))
      );
    }
    return result;
  }, [problems, sourceFilter, topicFilter, difficultyFilter, search]);

  const getLastAttempt = (problemId: string) =>
    attempts.find(a => a.problemId === problemId);

  const solvedCount = useMemo(() => {
    const solvedIds = new Set(attempts.filter(a => a.status === 'passed').map(a => a.problemId));
    return solvedIds.size;
  }, [attempts]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full min-w-0">
        {/* Header / Hero */}
        <div className="flex items-start justify-between gap-3">
          <div className="animate-fade-in min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-text-primary mb-1 flex items-center gap-2">
              <Terminal size={22} className="text-accent-blue shrink-0" />
              <span>Coding Lab</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-tertiary">Real Python Compiler Sandbox • Sir's Complete 29-Problem Practice Flow</p>
          </div>
          <button
            onClick={() => setShowContestModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-accent-copper/15 border border-accent-copper/30 text-accent-copper text-xs font-medium hover:bg-accent-copper/25 transition-all shadow-sm shrink-0"
          >
            <Trophy size={14} />
            <span className="hidden sm:inline">Virtual</span> Contest
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-surface-2 border border-border-default rounded-[10px] p-3 sm:p-4">
            <div className="text-3xs sm:text-2xs text-text-tertiary uppercase tracking-wider mb-1">Solved</div>
            <div className="text-lg sm:text-xl font-semibold text-accent-green">{solvedCount}</div>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-[10px] p-3 sm:p-4">
            <div className="text-3xs sm:text-2xs text-text-tertiary uppercase tracking-wider mb-1">Attempted</div>
            <div className="text-lg sm:text-xl font-semibold text-text-primary">
              {new Set(attempts.map(a => a.problemId)).size}
            </div>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-[10px] p-3 sm:p-4">
            <div className="text-3xs sm:text-2xs text-text-tertiary uppercase tracking-wider mb-1">Total Loaded</div>
            <div className="text-lg sm:text-xl font-semibold text-text-secondary">{problems.length}</div>
          </div>
        </div>

        {/* Dedicated Source Filter (Spec Section 3: Show All 29) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSourceFilter('SIR_SHEET')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-2 shrink-0 ${
              sourceFilter === 'SIR_SHEET'
                ? 'bg-accent-copper text-black font-semibold shadow-sm'
                : 'bg-surface-2 text-text-secondary hover:text-text-primary border border-border-default'
            }`}
          >
            <Sparkles size={13} />
            <span>SOURCE: SIR'S PRACTICE SHEET</span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
              sourceFilter === 'SIR_SHEET' ? 'bg-black/20 text-black' : 'bg-surface-4 text-accent-copper'
            }`}>
              {sirsCount} / 29
            </span>
          </button>

          <button
            onClick={() => setSourceFilter('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
              sourceFilter === 'All'
                ? 'bg-surface-4 text-text-primary font-semibold border border-border-strong'
                : 'bg-surface-2 text-text-secondary hover:text-text-primary border border-border-default'
            }`}
          >
            All Problems ({problems.length})
          </button>

          <button
            onClick={() => setSourceFilter('CORE')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
              sourceFilter === 'CORE'
                ? 'bg-surface-4 text-text-primary font-semibold border border-border-strong'
                : 'bg-surface-2 text-text-secondary hover:text-text-primary border border-border-default'
            }`}
          >
            Core ({problems.length - sirsCount})
          </button>
        </div>

        {/* Personalized Next Problem Card */}
        {recommendation && (
          <div className="bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 border border-accent-blue/30 rounded-[10px] p-4 sm:p-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-accent-blue flex items-center gap-1">
                    <Sparkles size={12} /> OM's Next Recommendation
                  </span>
                  <DiffBadge d={recommendation.problem.difficulty} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-text-primary truncate">{recommendation.problem.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{recommendation.reason}</p>
              </div>
              <button
                onClick={() => selectProblem(recommendation.problem.id)}
                className="shrink-0 px-4 py-2 rounded-full bg-white text-surface-0 text-xs font-semibold hover:bg-bone transition-all flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto"
              >
                <span>Start Problem</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:flex-1 sm:min-w-[180px]">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, topic, platform, or URL..."
              className="w-full bg-surface-3 border border-border-default rounded-full px-4 py-2 text-xs text-text-primary outline-none focus:border-border-strong transition-colors"
            />
          </div>
          <select
            value={topicFilter}
            onChange={e => setTopicFilter(e.target.value)}
            className="bg-surface-3 border border-border-default rounded-full px-3 py-2 text-xs text-text-primary outline-none"
          >
            {allTopics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            className="bg-surface-3 border border-border-default rounded-full px-3 py-2 text-xs text-text-primary outline-none"
          >
            <option value="All">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Problem List Counter */}
        <div className="flex items-center justify-between text-2xs text-text-tertiary px-1 font-mono">
          <span>
            {sourceFilter === 'SIR_SHEET'
              ? `Showing ${filtered.length} of 29 Sir's Sheet problems`
              : `Showing ${filtered.length} problems`}
          </span>
          {sourceFilter === 'SIR_SHEET' && (
            <span className="text-accent-copper font-semibold">29 / 29 Source Entries Loaded</span>
          )}
        </div>

        {/* Problem Cards List */}
        <div className="space-y-1.5">
          {filtered.map(problem => {
            const lastAttempt = getLastAttempt(problem.id);
            return (
              <div
                key={problem.id}
                onClick={() => selectProblem(problem.id)}
                className="w-full flex items-center justify-between gap-3 bg-surface-2 border border-border-default rounded-[10px] p-4 hover:bg-surface-3 hover:border-border-strong transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    {lastAttempt ? (
                      <StatusIcon status={lastAttempt.status} />
                    ) : (
                      <div className="w-3 h-3 rounded-full border-2 border-border-default" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {problem.sourceOrder && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-accent-copper/15 text-accent-copper border border-accent-copper/30">
                          #{problem.sourceOrder}
                        </span>
                      )}
                      <span className="text-sm font-medium text-text-primary group-hover:text-white transition-colors truncate">
                        {problem.title}
                      </span>
                      {problem.isDuplicatePreserved && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Duplicate
                        </span>
                      )}
                      {problem.platform && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-4 text-text-tertiary">
                          {problem.platform}
                        </span>
                      )}
                    </div>
                    <div className="text-2xs text-text-tertiary flex items-center gap-2 mt-1">
                      {problem.topics.slice(0, 3).map(t => (
                        <span key={t} className="text-text-quaternary">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <DiffBadge d={problem.difficulty} />
                  <span className="px-3 py-1 rounded-full bg-accent-copper text-black font-semibold text-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <span>Practice</span>
                    <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Virtual Contest Setup Modal */}
      {showContestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface-2 border border-border-default rounded-[12px] p-6 max-w-md w-full space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-accent-copper" />
                <h3 className="text-base font-semibold text-text-primary">Start Virtual Contest</h3>
              </div>
              <button onClick={() => setShowContestModal(false)} className="text-text-tertiary hover:text-text-primary text-xs">
                ✕
              </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Virtual contest mode simulates real interview pressure with a strict countdown timer. OM hints and solutions are disabled during the contest.
            </p>
            <div className="space-y-2">
              <label className="text-2xs uppercase tracking-wider text-text-tertiary font-semibold">Duration</label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 60, 90, 120].map(m => (
                  <button
                    key={m}
                    onClick={() => setContestDuration(m)}
                    className={`py-2 text-xs font-semibold rounded-[8px] border transition-all ${
                      contestDuration === m
                        ? 'border-accent-copper bg-accent-copper/20 text-accent-copper'
                        : 'border-border-default bg-surface-3 text-text-secondary hover:border-border-strong'
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowContestModal(false)}
                className="px-4 py-2 rounded-full text-xs text-text-tertiary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowContestModal(false);
                  startVirtualContest(contestDuration);
                }}
                className="px-5 py-2 rounded-full bg-accent-copper text-white text-xs font-semibold hover:bg-accent-copper/90 transition-all shadow-sm"
              >
                Begin Contest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Problem Workspace =====
function ProblemWorkspace() {
  const {
    selectedProblem, currentLanguage, setLanguage,
    editorCode, setEditorCode,
    executionStatus, executionResult, isExecuting,
    customInput, setCustomInput,
    runCode, submitCode, stopExecution,
    testResults, consoleTab, setConsoleTab,
    mode, setMode, currentHintLevel, revealNextHint,
    isSolutionRevealed, revealSolution, resetHints,
    attempts, restoreAttemptCode, compareAttempt, setCompareAttempt,
    contestTimerSeconds, isContestTimerRunning, tickContestTimer,
    activeVirtualContest, finishVirtualContest,
    setLabView,
  } = useCodingLabStore();

  const { setCurrentPage } = useAppStore();

  const editorRef = useRef<any>(null);
  const [mobileTab, setMobileTab] = useState<'problem' | 'code' | 'console' | 'om'>('code');
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [customInputMode, setCustomInputMode] = useState<'builder' | 'raw'>('builder');
  const currentUser = authService.getCurrentUser();
  const mentorSalutation = getMentorAddress(currentUser, 'hint');

  // Contest timer ticker
  useEffect(() => {
    if (!isContestTimerRunning) return;
    const interval = setInterval(() => {
      tickContestTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isContestTimerRunning, tickContestTimer]);

  const problem = selectedProblem;
  if (!problem) return null;

  // Editable Test Cases & Single Test Execution State
  const [editableTestCases, setEditableTestCases] = useState<TestCase[]>([]);
  const [runningTestCaseId, setRunningTestCaseId] = useState<string | null>(null);
  const [singleTestResults, setSingleTestResults] = useState<Record<string, { passed: boolean; actualOutput: string; executionTimeMs: number; error?: string }>>({});

  useEffect(() => {
    if (problem) {
      const visible = (problem.testCases || []).filter(tc => !tc.isHidden);
      setEditableTestCases(visible.map(t => ({ ...t })));
      setSingleTestResults({});
      if (!customInput && visible.length > 0) {
        setCustomInput(visible[0].input);
      }
    }
  }, [problem?.id]);

  const handleRunSingleTest = async (tc: TestCase) => {
    if (isExecuting) return;
    setRunningTestCaseId(tc.id);
    soundManager.play('click');
    try {
      const res = await executeCode(editorCode, currentLanguage, tc.input);
      const actual = res.stdout.trim();
      const expected = tc.expectedOutput.trim();
      const passed = actual === expected && res.status === 'passed';
      setSingleTestResults(prev => ({
        ...prev,
        [tc.id]: {
          passed,
          actualOutput: actual,
          executionTimeMs: res.executionTimeMs,
          error: res.stderr || (res.status !== 'passed' ? res.compilationError : undefined),
        }
      }));
      if (passed) soundManager.play('taskCompleted');
      else soundManager.play('error');
    } catch (err: any) {
      setSingleTestResults(prev => ({
        ...prev,
        [tc.id]: {
          passed: false,
          actualOutput: '',
          executionTimeMs: 0,
          error: err?.message || 'Execution failed',
        }
      }));
      soundManager.play('error');
    } finally {
      setRunningTestCaseId(null);
    }
  };

  const handleRunAllTests = () => {
    runCode();
  };

  const handleAddNewTestCase = () => {
    const newTc: TestCase = {
      id: `custom-${Date.now()}`,
      input: '',
      expectedOutput: '',
      isHidden: false,
    };
    setEditableTestCases(prev => [...prev, newTc]);
    soundManager.play('click');
  };

  const handleUpdateTestCase = (id: string, input: string, expectedOutput: string) => {
    setEditableTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, input, expectedOutput } : tc));
  };

  const handleDeleteTestCase = (id: string) => {
    setEditableTestCases(prev => prev.filter(tc => tc.id !== id));
    setSingleTestResults(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    soundManager.play('click');
  };

  const langConfig = LANGUAGE_CONFIGS[currentLanguage];
  const availableLanguages: SupportedLanguage[] = ['python', 'cpp', 'javascript', 'java', 'c', 'typescript'];

  // Bhai Coach Analysis
  const complexityWarning = useMemo(() => {
    return analyzeCodeComplexity(editorCode, problem);
  }, [editorCode, problem]);

  const failureAdvice = useMemo(() => {
    if (executionResult && executionResult.status !== 'passed' && executionResult.status !== 'idle') {
      return analyzeExecutionFailure(executionResult, problem);
    }
    return null;
  }, [executionResult, problem]);

  const repeatedMistakePattern = useMemo(() => {
    return checkRepeatedMistakes(attempts, problem);
  }, [attempts, problem]);

  // Contextual Next-Code Suggestion (Pedagogical Scaffolding)
  const [suggestionMode, setSuggestionMode] = useState<CodeSuggestionMode>('LIGHT');
  const contextualSuggestion = useMemo(() => {
    return getContextualCodeSuggestion(editorCode, problem, currentLanguage, suggestionMode);
  }, [editorCode, problem, currentLanguage, suggestionMode]);

  const handleInsertSuggestion = (codeToInsert: string) => {
    const newCode = editorCode ? `${editorCode.trimEnd()}\n\n${codeToInsert}\n` : `${codeToInsert}\n`;
    setEditorCode(newCode);
    soundManager.play('click');
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    // Ctrl+Enter -> RUN (visible tests)
    editor.addCommand(2048 + 3, () => {
      runCode();
    });
    // Ctrl+Shift+Enter -> SUBMIT (real judging with hidden tests)
    editor.addCommand(2048 + 1024 + 3, () => {
      submitCode();
    });
  };

  const handleReset = () => {
    const starterCode = problem.starterCode[currentLanguage] || LANGUAGE_CONFIGS[currentLanguage]?.template || '';
    setEditorCode(starterCode);
    soundManager.play('click');
  };

  // Deep-link to Learning page for this problem's concept
  const handleLearnConcept = () => {
    soundManager.play('navigation');
    setCurrentPage('learning');
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-surface-0">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-border-default bg-surface-1 shrink-0 overflow-x-auto no-scrollbar max-w-full">
        <button
          onClick={() => setLabView('home')}
          className="flex items-center gap-1 text-text-tertiary hover:text-text-primary transition-colors text-xs"
        >
          <ArrowLeft size={14} />
          Problems
        </button>
        <div className="h-4 w-px bg-border-default mx-1" />
        <span className="text-xs font-medium text-text-primary truncate">{problem.title}</span>
        <DiffBadge d={problem.difficulty} />

        <div className="flex-1" />

        {/* Contest Timer display if contest is active */}
        {isContestTimerRunning && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-red/10 border border-accent-red/30 text-accent-red font-mono text-xs font-semibold animate-pulse">
            <Timer size={14} />
            {formatTime(contestTimerSeconds)}
            {activeVirtualContest && (
              <button
                onClick={finishVirtualContest}
                className="ml-2 px-2 py-0.5 rounded-full bg-accent-red text-white text-2xs hover:bg-accent-red/90"
              >
                Finish Contest
              </button>
            )}
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex items-center bg-surface-3 rounded-full p-0.5 border border-border-default">
          <button
            onClick={() => setMode('learning')}
            className={`px-3 py-1 rounded-full text-2xs font-medium transition-all ${
              mode === 'learning' ? 'bg-surface-1 text-accent-blue shadow-sm' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            📚 Learning
          </button>
          <button
            onClick={() => setMode('contest')}
            className={`px-3 py-1 rounded-full text-2xs font-medium transition-all ${
              mode === 'contest' ? 'bg-accent-red/20 text-accent-red shadow-sm' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            ⏱ Contest
          </button>
        </div>

        {/* Diagnostics Button (Spec Section 12) */}
        <button
          onClick={() => setShowDiagnostics(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-3 hover:bg-surface-4 text-text-tertiary hover:text-text-primary text-2xs transition-colors border border-border-default shrink-0"
          title="Open Coding Engine Status & Diagnostics"
        >
          <Cpu size={12} className="text-accent-copper" />
          <span className="hidden sm:inline">Engine Status</span>
        </button>

        {/* Language selector */}
        <select
          value={currentLanguage}
          onChange={e => setLanguage(e.target.value as SupportedLanguage)}
          className="bg-surface-3 border border-border-default rounded-full px-3 py-1 text-2xs text-text-primary outline-none focus:border-border-strong cursor-pointer shrink-0"
        >
          {availableLanguages.map(l => (
            <option key={l} value={l}>{LANGUAGE_CONFIGS[l].name}</option>
          ))}
        </select>
      </div>

      {/* Mobile Tab Switcher (Visible only on < lg screens - Spec Section 28) */}
      <div className="lg:hidden flex items-center justify-around border-b border-border-default bg-surface-2 p-1 shrink-0">
        {(['problem', 'code', 'console', 'om'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`px-3 py-1.5 text-2xs font-medium rounded-full uppercase tracking-wider transition-all ${
              mobileTab === tab ? 'bg-surface-4 text-text-primary font-bold' : 'text-text-tertiary'
            }`}
          >
            {tab === 'om' ? 'OM' : tab}
          </button>
        ))}
      </div>

      {/* 3-Column Desktop Layout: LEFT (Problem) | CENTER (Editor + Bottom Console) | RIGHT (Bhai Coach) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT: Problem Description & Concept Link */}
        <div
          className={`shrink-0 border-r border-border-default overflow-y-auto bg-surface-1 w-full lg:w-[320px] xl:w-[360px] ${
            mobileTab !== 'problem' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              {problem.source === 'SIR_SHEET' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-accent-copper/15 text-accent-copper border border-accent-copper/30">
                    Sir's Sheet #{problem.sourceOrder}
                  </span>
                  {problem.isDuplicatePreserved && (
                    <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30">
                      Preserved Duplicate
                    </span>
                  )}
                </div>
              )}
              <h2 className="text-base font-semibold text-text-primary">{problem.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <DiffBadge d={problem.difficulty} />
                {problem.platform && (
                  <span className="text-2xs px-2 py-0.5 rounded-full bg-surface-3 text-text-secondary border border-border-subtle">
                    {problem.platform}
                  </span>
                )}
                {problem.topics.map(t => (
                  <span key={t} className="text-2xs px-2 py-0.5 rounded-full bg-surface-4 text-text-tertiary">{t}</span>
                ))}
              </div>

              {/* Exact Source Official Problem Link */}
              <div className="pt-1">
                {problem.platformUrl ? (
                  <a
                    href={problem.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 border border-border-default text-text-primary text-2xs font-medium transition-colors"
                  >
                    <span>OFFICIAL PROBLEM</span>
                    <ExternalLink size={12} className="text-accent-copper" />
                  </a>
                ) : (
                  <div className="text-3xs text-text-quaternary italic">
                    Official metadata unavailable.
                  </div>
                )}
              </div>
            </div>

            {/* 12-Step Practice Flow Guide */}
            <div className="bg-surface-2 border border-border-subtle rounded-[10px] p-3 space-y-2">
              <div className="flex items-center justify-between text-2xs font-semibold text-text-primary">
                <span className="flex items-center gap-1.5">
                  <Layers size={12} className="text-accent-copper" />
                  12-Step Practice Flow
                </span>
                <span className="text-3xs text-accent-copper font-mono">Step 7 of 12</span>
              </div>
              <div className="text-3xs text-text-tertiary leading-relaxed space-y-0.5 font-mono">
                <div className="text-accent-green">✓ 1. Understand Problem</div>
                <div className="text-accent-green">✓ 2. Identify Input</div>
                <div className="text-accent-green">✓ 3. Identify Output</div>
                <div className="text-accent-green">✓ 4. Check Constraints</div>
                <div className="text-accent-green">✓ 5. Try Your Approach</div>
                <div className="text-accent-green">✓ 6. Open Coding Lab</div>
                <div className="text-accent-copper font-bold">➜ 7. Write Python (Active)</div>
                <div>○ 8. Create Test Case</div>
                <div>○ 9. Run</div>
                <div>○ 10. Debug</div>
                <div>○ 11. Submit</div>
                <div>○ 12. Complexity</div>
              </div>
            </div>

            {/* Learn This Concept Button */}
            <div className="bg-surface-2 border border-border-subtle rounded-[10px] p-3 space-y-2">
              <div className="text-2xs font-semibold text-text-secondary flex items-center gap-1.5">
                <BookOpen size={12} className="text-accent-blue" />
                Theory & Visualizer
              </div>
              <p className="text-2xs text-text-tertiary">
                Requires: <strong className="text-text-secondary">{problem.topics.join(', ')}</strong>
              </p>
              <button
                onClick={handleLearnConcept}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-2xs font-medium hover:bg-accent-blue/20 transition-all"
              >
                Learn This Concept
                <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Description */}
            <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
              {problem.description}
            </div>

            {/* Input & Output Format */}
            {(problem.inputFormat || problem.outputFormat) && (
              <div className="space-y-2 pt-1 border-t border-border-subtle">
                {problem.inputFormat && (
                  <div>
                    <div className="text-3xs font-semibold uppercase tracking-wider text-text-tertiary mb-0.5">Input Format</div>
                    <div className="text-2xs text-text-secondary font-mono bg-surface-2 p-2 rounded-[6px]">{problem.inputFormat}</div>
                  </div>
                )}
                {problem.outputFormat && (
                  <div>
                    <div className="text-3xs font-semibold uppercase tracking-wider text-text-tertiary mb-0.5">Output Format</div>
                    <div className="text-2xs text-text-secondary font-mono bg-surface-2 p-2 rounded-[6px]">{problem.outputFormat}</div>
                  </div>
                )}
              </div>
            )}

            {/* Examples */}
            {problem.examples.map((ex, i) => (
              <div key={i} className="space-y-1">
                <div className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider">Example {i + 1}</div>
                <div className="bg-surface-3 rounded-[8px] p-3 font-mono text-2xs space-y-1">
                  <div><span className="text-text-tertiary">Input: </span><span className="text-text-primary whitespace-pre-wrap">{ex.input}</span></div>
                  <div><span className="text-text-tertiary">Output: </span><span className="text-accent-green whitespace-pre-wrap">{ex.output}</span></div>
                  {ex.explanation && (
                    <div className="text-text-quaternary mt-1 italic">{ex.explanation}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Constraints */}
            <div>
              <div className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Constraints</div>
              <ul className="text-2xs text-text-secondary space-y-1 font-mono">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-accent-copper">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Complexity Targets */}
            {problem.timeComplexity && (
              <div className="text-2xs text-text-quaternary pt-2 border-t border-border-subtle">
                <span className="text-text-tertiary font-medium">Target Complexity: </span>
                Time {problem.timeComplexity}{problem.spaceComplexity && `, Space ${problem.spaceComplexity}`}
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Editor + Bottom Console Panel */}
        <div
          className={`flex-1 flex flex-col min-w-0 overflow-hidden ${
            mobileTab !== 'code' && mobileTab !== 'console' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Monaco Editor */}
          <div className={`flex-1 min-h-0 bg-[#1e1e1e] max-w-full overflow-hidden ${
            mobileTab === 'console' ? 'hidden lg:block' : 'block'
          }`}>
            <Editor
              height="100%"
              language={langConfig?.monacoLang || 'plaintext'}
              value={editorCode}
              onChange={(val) => setEditorCode(val || '')}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'off',
                lineNumbers: 'on',
                folding: true,
                bracketPairColorization: { enabled: true },
                padding: { top: 12 },
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
              }}
            />
          </div>

          {/* Contextual Next-Code Suggestion Banner (Pedagogical Scaffolding) */}
          {contextualSuggestion && mode === 'learning' && (
            <div className="px-3 sm:px-4 py-2.5 bg-surface-2 border-t border-accent-copper/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 animate-fade-in">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-copper/20 text-accent-copper border border-accent-copper/40 font-semibold uppercase">
                    OM Suggestion • {contextualSuggestion.contextLabel}
                  </span>
                  <span className="text-3xs text-text-tertiary">
                    Mode: {suggestionMode}
                  </span>
                </div>
                <p className="text-2xs text-text-secondary leading-snug line-clamp-2">
                  <strong className="text-accent-copper font-medium">Why this next?</strong> {contextualSuggestion.whyThisNext}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleInsertSuggestion(contextualSuggestion.suggestedCode)}
                  className="px-3 py-1 rounded-full bg-accent-copper text-black font-semibold text-2xs hover:bg-accent-copper/90 transition-colors shadow-sm"
                >
                  Insert Code
                </button>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 border-t border-border-default bg-surface-1 shrink-0 overflow-x-auto no-scrollbar max-w-full ${
            mobileTab === 'console' ? 'hidden lg:flex' : 'flex'
          }`}>
            {isExecuting ? (
              <button
                onClick={stopExecution}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-red/10 text-accent-red text-xs font-medium hover:bg-accent-red/20 transition-colors"
              >
                <Square size={12} /> Stop
              </button>
            ) : (
              <>
                <button
                  onClick={() => runCode()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-3 text-text-primary border border-border-default text-xs font-medium hover:bg-surface-4 hover:border-border-strong transition-all"
                  title="Run visible test cases or custom input (Ctrl+Enter)"
                >
                  <Play size={12} className="text-accent-green" /> Run
                </button>
                <button
                  onClick={submitCode}
                  className="flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-white text-surface-0 text-xs font-semibold hover:bg-bone transition-all shadow-sm"
                  title="Submit code against all test cases including hidden tests (Ctrl+Shift+Enter)"
                >
                  <Send size={12} /> Submit
                </button>
              </>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-text-tertiary hover:text-text-primary text-xs transition-colors"
            >
              <RotateCcw size={12} /> Reset
            </button>

            {/* Contextual Suggestion Mode Switcher */}
            {mode === 'learning' && (
              <div className="flex items-center gap-1 bg-surface-2 border border-border-default rounded-full p-0.5 text-3xs ml-1">
                <span className="text-text-tertiary px-1.5 uppercase font-mono">Guide:</span>
                {(['OFF', 'LIGHT', 'GUIDED'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSuggestionMode(m)}
                    className={`px-2 py-0.5 rounded-full font-mono transition-all ${
                      suggestionMode === m
                        ? 'bg-accent-copper text-black font-bold'
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1" />

            {/* Execution Result Status Label */}
            {executionStatus !== 'idle' && (
              <div className="flex items-center gap-1.5 text-xs">
                <StatusIcon status={executionStatus} />
                <span className={
                  executionStatus === 'passed' ? 'text-accent-green font-medium' :
                  executionStatus === 'wrong_answer' || executionStatus === 'runtime_error' ? 'text-accent-red font-medium' :
                  executionStatus === 'compilation_error' || executionStatus === 'time_limit' ? 'text-accent-yellow font-medium' :
                  'text-text-secondary'
                }>
                  {statusLabels[executionStatus] || executionStatus}
                </span>
                {executionResult?.executionTimeMs !== undefined && executionResult.executionTimeMs > 0 && (
                  <span className="text-text-quaternary text-2xs">
                    ({executionResult.executionTimeMs}ms)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bottom Console Panel */}
          <div className={`border-t border-border-default bg-surface-1 shrink-0 overflow-hidden flex flex-col ${
            mobileTab === 'code' ? 'hidden lg:flex lg:h-64' :
            mobileTab === 'console' ? 'flex-1 min-h-0 lg:h-64 lg:flex-none' : 'hidden lg:flex lg:h-64'
          }`}>
            {/* Console Tabs */}
            <div className="flex items-center gap-0 border-b border-border-subtle px-2 shrink-0 bg-surface-1 overflow-x-auto no-scrollbar">
              {(['input', 'output', 'error', 'testresults', 'custom', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setConsoleTab(tab)}
                  className={`px-3 py-2 text-2xs font-medium transition-colors border-b-2 capitalize whitespace-nowrap ${
                    consoleTab === tab || (tab === 'testresults' && consoleTab === 'testcases')
                      ? 'text-text-primary border-accent-copper font-semibold'
                      : 'text-text-tertiary border-transparent hover:text-text-secondary'
                  }`}
                >
                  {tab === 'input' ? 'Input (stdin)' :
                   tab === 'output' ? 'Output' :
                   tab === 'error' ? 'Error' :
                   tab === 'testresults' ? `Test Cases (${editableTestCases.length})` :
                   tab === 'custom' ? 'Build Test' :
                   `History (${attempts.filter(a => a.problemId === problem.id).length})`}
                </button>
              ))}
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-3 bg-surface-0 font-mono text-2xs">
              {/* INPUT TAB */}
              {consoleTab === 'input' && (
                <div className="space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xs font-semibold text-text-primary">Standard Input (stdin)</span>
                      <p className="text-3xs text-text-tertiary">Passed directly to Python runtime sys.stdin / input()</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => runCode(customInput)}
                        disabled={isExecuting}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-green text-surface-0 text-2xs font-semibold hover:bg-accent-green/90 transition-all disabled:opacity-40"
                      >
                        <Play size={10} /> RUN
                      </button>
                      <button
                        onClick={() => setCustomInput('')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-3 text-text-tertiary hover:text-text-primary text-2xs transition-colors"
                      >
                        <Trash2 size={10} /> CLEAR
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="Enter multiline input here...&#10;Example:&#10;5&#10;2 4 1 7 3&#10;1 3"
                    className="w-full h-32 bg-surface-2 border border-border-default rounded-[8px] p-3 font-mono text-xs text-text-primary outline-none focus:border-border-strong resize-none"
                  />
                  {problem.examples.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-3xs text-text-tertiary uppercase">Quick Fill:</span>
                      {problem.examples.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => setCustomInput(ex.input)}
                          className="px-2 py-0.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-secondary text-3xs border border-border-subtle"
                        >
                          Example {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* OUTPUT TAB */}
              {consoleTab === 'output' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-border-subtle font-sans">
                    <span className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider">Standard Output (stdout)</span>
                    {executionResult?.executionTimeMs !== undefined && (
                      <span className="text-3xs text-text-quaternary font-mono">Time: {executionResult.executionTimeMs}ms</span>
                    )}
                  </div>
                  {executionResult ? (
                    <>
                      {executionResult.stdout ? (
                        <pre className="text-text-primary whitespace-pre-wrap p-2.5 rounded-[8px] bg-surface-2 font-mono text-2xs leading-relaxed border border-border-subtle">
                          {executionResult.stdout}
                        </pre>
                      ) : (
                        <div className="text-text-quaternary italic py-2">Process exited with code {executionResult.exitCode} (No stdout produced).</div>
                      )}
                    </>
                  ) : (
                    <div className="text-text-quaternary italic py-4">Click [RUN] or [SUBMIT] to see real output.</div>
                  )}
                </div>
              )}

              {/* ERROR TAB */}
              {consoleTab === 'error' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-border-subtle font-sans">
                    <span className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider">Standard Error & Diagnostics</span>
                  </div>
                  {executionResult?.compilationError || executionResult?.stderr ? (
                    <div className="p-3 rounded-[8px] bg-accent-red/10 border border-accent-red/30 space-y-2">
                      <div className="text-2xs font-semibold text-accent-red flex items-center gap-1.5">
                        <AlertTriangle size={13} /> Execution Error Detected
                      </div>
                      <pre className="text-accent-red font-mono text-2xs whitespace-pre-wrap leading-relaxed">
                        {executionResult.compilationError || executionResult.stderr}
                      </pre>
                    </div>
                  ) : executionResult ? (
                    <div className="p-3 rounded-[8px] bg-accent-green/10 border border-accent-green/20 text-accent-green text-2xs flex items-center gap-1.5 font-sans">
                      <CheckCircle2 size={13} /> No errors detected. Clean execution.
                    </div>
                  ) : (
                    <div className="text-text-quaternary italic py-4">No errors.</div>
                  )}
                </div>
              )}

              {/* TEST RESULTS TAB */}
              {(consoleTab === 'testresults' || consoleTab === 'testcases') && (
                <div className="space-y-3 font-sans">
                  {/* Action Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-border-subtle flex-wrap gap-2">
                    <span className="text-2xs font-semibold text-text-primary">
                      Test Cases ({editableTestCases.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRunAllTests}
                        disabled={isExecuting}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent-copper text-white text-2xs font-semibold hover:bg-accent-copper/90 transition-all disabled:opacity-40"
                      >
                        <Play size={10} /> RUN ALL
                      </button>
                      <button
                        onClick={handleAddNewTestCase}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-3 text-text-primary text-2xs font-medium hover:bg-surface-4 transition-colors border border-border-default"
                      >
                        <Plus size={10} /> ADD TEST
                      </button>
                      <button
                        onClick={() => setConsoleTab('custom')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-blue/15 text-accent-blue text-2xs font-medium hover:bg-accent-blue/25 transition-colors border border-accent-blue/30"
                      >
                        <Sparkles size={10} /> CREATE MY TEST CASE
                      </button>
                    </div>
                  </div>

                  {/* List of Test Cases */}
                  <div className="space-y-3">
                    {editableTestCases.map((tc, idx) => {
                      const isRunning = runningTestCaseId === tc.id;
                      const singleRes = singleTestResults[tc.id];
                      const globalRes = testResults.find(r => r.testCaseId === tc.id);
                      const passed = singleRes ? singleRes.passed : globalRes?.passed;
                      const actualOutput = singleRes ? singleRes.actualOutput : globalRes?.actualOutput;
                      const execError = singleRes ? singleRes.error : globalRes?.error;

                      return (
                        <div
                          key={tc.id}
                          className={`rounded-[10px] border p-3 text-2xs transition-all ${
                            passed === true ? 'border-accent-green/30 bg-accent-green/5' :
                            passed === false ? 'border-accent-red/30 bg-accent-red/5' :
                            'border-border-default bg-surface-2'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-semibold">
                              {isRunning ? (
                                <div className="w-3 h-3 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
                              ) : passed === true ? (
                                <CheckCircle2 size={13} className="text-accent-green" />
                              ) : passed === false ? (
                                <XCircle size={13} className="text-accent-red" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-text-quaternary" />
                              )}
                              <span className="text-text-primary uppercase tracking-wide">
                                TEST CASE {idx + 1}
                              </span>
                              <span className={`text-3xs px-2 py-0.5 rounded-full font-medium ${
                                isRunning ? 'bg-accent-blue/20 text-accent-blue' :
                                passed === true ? 'bg-accent-green/20 text-accent-green' :
                                passed === false ? 'bg-accent-red/20 text-accent-red' :
                                'bg-surface-4 text-text-quaternary'
                              }`}>
                                {isRunning ? 'Running...' : passed === true ? 'Passed' : passed === false ? 'Failed' : 'Ready'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRunSingleTest(tc)}
                                disabled={isExecuting || isRunning}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary text-3xs font-medium border border-border-default disabled:opacity-40"
                              >
                                <Play size={8} className="text-accent-green" /> RUN TEST
                              </button>
                              {tc.id.startsWith('custom-') && (
                                <button
                                  onClick={() => handleDeleteTestCase(tc.id)}
                                  className="text-text-quaternary hover:text-accent-red p-1"
                                  title="Delete test case"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono">
                            <div>
                              <div className="text-3xs uppercase tracking-wider text-text-tertiary mb-1">Input (Editable)</div>
                              <textarea
                                value={tc.input}
                                onChange={e => handleUpdateTestCase(tc.id, e.target.value, tc.expectedOutput)}
                                rows={2}
                                className="w-full bg-surface-0 border border-border-subtle rounded-[6px] p-2 text-2xs text-text-primary outline-none focus:border-border-strong resize-none"
                              />
                            </div>
                            <div>
                              <div className="text-3xs uppercase tracking-wider text-text-tertiary mb-1">Expected Output (Editable)</div>
                              <textarea
                                value={tc.expectedOutput}
                                onChange={e => handleUpdateTestCase(tc.id, tc.input, e.target.value)}
                                rows={2}
                                className="w-full bg-surface-0 border border-border-subtle rounded-[6px] p-2 text-2xs text-text-primary outline-none focus:border-border-strong resize-none"
                              />
                            </div>
                          </div>

                          {actualOutput !== undefined && (
                            <div className="mt-2 pt-2 border-t border-border-subtle font-mono text-2xs space-y-1">
                              <div>
                                <span className="text-text-tertiary">Got: </span>
                                <span className={passed ? 'text-accent-green' : 'text-accent-red'}>
                                  {actualOutput || '(empty output)'}
                                </span>
                              </div>
                              {execError && (
                                <div className="text-accent-red text-3xs">{execError}</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BUILD TEST TAB (CustomTestCaseBuilder) */}
              {consoleTab === 'custom' && (
                <div className="font-sans">
                  <CustomTestCaseBuilder
                    editorCode={editorCode}
                    currentLanguage={currentLanguage}
                    problemTitle={problem.title}
                    inputFormat={problem.inputFormat}
                    outputFormat={problem.outputFormat}
                  />
                </div>
              )}

              {/* HISTORY TAB */}
              {consoleTab === 'history' && (
                <div className="space-y-2 font-sans">
                  {attempts.filter(a => a.problemId === problem.id).map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-[8px] border border-border-subtle bg-surface-2 hover:bg-surface-3 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <StatusIcon status={att.status} />
                        <div>
                          <div className="text-2xs font-semibold text-text-primary uppercase tracking-wide">
                            {att.status.replace('_', ' ')}
                          </div>
                          <div className="text-3xs text-text-tertiary">
                            {new Date(att.timestamp).toLocaleTimeString()} • {att.language}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => restoreAttemptCode(att.code)}
                        className="px-2.5 py-1 rounded-full bg-surface-4 text-text-secondary text-2xs hover:text-text-primary transition-colors"
                      >
                        Restore Code
                      </button>
                    </div>
                  ))}
                  {attempts.filter(a => a.problemId === problem.id).length === 0 && (
                    <div className="text-text-quaternary italic py-4">No previous attempts recorded yet.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: OM Mentor Panel */}
        <div
          className={`shrink-0 border-l border-border-default overflow-y-auto bg-surface-1 w-full lg:w-[320px] xl:w-[350px] ${
            mobileTab !== 'om' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-copper/20 flex items-center justify-center text-accent-copper font-bold text-xs">
                  ॐ
                </div>
                <h3 className="text-sm font-semibold text-text-primary">OM Senior Mentor</h3>
              </div>
              <span className="text-3xs text-accent-copper uppercase font-semibold tracking-wider">
                {mode === 'learning' ? 'Active Coach' : 'Contest Locked'}
              </span>
            </div>

            {/* Personalized Welcome Callout */}
            <div className="p-2.5 rounded-[8px] bg-surface-2 border border-border-subtle text-2xs text-text-secondary leading-relaxed">
              <span className="font-semibold text-accent-copper">{mentorSalutation}</span>, pehle problem statement aur input constraints ko identify karte hain.
            </div>

            {/* Contest Rule Notification if Contest Mode */}
            {mode === 'contest' && (
              <div className="bg-accent-red/10 border border-accent-red/20 rounded-[10px] p-3 text-2xs text-text-secondary space-y-1">
                <div className="font-semibold text-accent-red flex items-center gap-1">
                  <Lock size={12} /> Contest Mode Active
                </div>
                <p>Hints and solution reveals are locked during contest mode to preserve realistic contest conditions.</p>
              </div>
            )}

            {/* Repeated Mistake Pattern Alert */}
            {repeatedMistakePattern && (
              <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-[10px] p-3 space-y-2 animate-fade-in">
                <div className="text-2xs font-semibold text-accent-yellow flex items-center gap-1.5">
                  <Flame size={14} /> Pattern Detected
                </div>
                <p className="text-2xs text-text-secondary leading-relaxed">
                  {repeatedMistakePattern.message}
                </p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    onClick={handleLearnConcept}
                    className="w-full text-center px-3 py-1 rounded-full bg-accent-yellow/20 text-accent-yellow font-semibold text-2xs hover:bg-accent-yellow/30 transition-all"
                  >
                    Review {repeatedMistakePattern.topic}
                  </button>
                  <button
                    onClick={() => setLabView('home')}
                    className="w-full text-center px-3 py-1 rounded-full bg-surface-3 text-text-secondary text-2xs hover:text-text-primary"
                  >
                    Try Easier Problem
                  </button>
                </div>
              </div>
            )}

            {/* Complexity Advice / Bottleneck Warning */}
            {complexityWarning && mode === 'learning' && (
              <div className="bg-surface-2 border border-accent-copper/40 rounded-[10px] p-3 space-y-1.5 animate-fade-in">
                <div className="text-2xs font-semibold text-accent-copper flex items-center gap-1">
                  <AlertTriangle size={12} /> {complexityWarning.headline}
                </div>
                <p className="text-2xs text-text-secondary leading-relaxed">
                  {complexityWarning.message}
                </p>
              </div>
            )}

            {/* Error Guidance (Spec Section 11: WHAT HAPPENED / WHY / HOW TO FIX) */}
            {executionResult && executionResult.status !== 'passed' && executionResult.status !== 'idle' && mode === 'learning' && (
              (() => {
                const fb = formatOmErrorFeedback({
                  errorType: executionResult.status,
                  errorMessage: executionResult.stderr || executionResult.compilationError || '',
                  user: currentUser,
                });
                return (
                  <div className="bg-surface-2 border border-accent-red/30 rounded-[10px] p-3.5 space-y-2 animate-fade-in">
                    <div className="text-2xs font-semibold text-accent-red flex items-center gap-1">
                      <HelpCircle size={13} /> {fb.address}, execution inspect karte hain:
                    </div>
                    <div className="space-y-1.5 text-2xs">
                      <div>
                        <span className="font-bold text-accent-copper uppercase tracking-wider text-3xs block">WHAT HAPPENED</span>
                        <p className="text-text-primary">{fb.whatHappened}</p>
                      </div>
                      <div>
                        <span className="font-bold text-accent-yellow uppercase tracking-wider text-3xs block">WHY</span>
                        <p className="text-text-secondary">{fb.why}</p>
                      </div>
                      <div>
                        <span className="font-bold text-accent-green uppercase tracking-wider text-3xs block">HOW TO FIX</span>
                        <p className="text-text-secondary">{fb.howToFix}</p>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Progressive Hints (Spec Section 10: 5 Hints) - Learning Mode Only */}
            {mode === 'learning' && (
              <div className="space-y-3 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Progressive Hints ({currentHintLevel}/5)
                  </span>
                  {currentHintLevel > 0 && (
                    <button onClick={resetHints} className="text-3xs text-text-quaternary hover:text-text-tertiary">
                      Reset
                    </button>
                  )}
                </div>

                {/* Render Unlocked Hints */}
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].slice(0, currentHintLevel).map(lvl => {
                    const titles = [
                      'HINT 1 — Direction',
                      'HINT 2 — Observation',
                      'HINT 3 — Technique',
                      'HINT 4 — Approach',
                      'HINT 5 — Pseudocode'
                    ];
                    const hintIntro = formatOmHintIntro(lvl, currentUser);
                    const hintData = getStructuredHint(problem, lvl <= 4 ? lvl : 4);
                    return (
                      <div key={lvl} className="bg-surface-2 border border-border-subtle rounded-[8px] p-3 text-2xs space-y-1.5 animate-fade-in">
                        <div className="font-semibold text-accent-copper text-3xs uppercase tracking-wide">
                          {titles[lvl - 1]}
                        </div>
                        <p className="text-text-tertiary text-2xs italic">“{hintIntro}”</p>
                        <div className="text-text-secondary whitespace-pre-wrap font-mono text-2xs">
                          {lvl === 5
                            ? (problem.structuredHints?.pseudocode || 'Initialize pointers left = 0, right = n - 1\nWhile left < right:\n  Calculate current sum\n  If sum == target: return indices\n  If sum < target: left += 1\n  Else: right -= 1')
                            : hintData?.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reveal Next Hint Button */}
                {currentHintLevel < 5 && (
                  <button
                    onClick={revealNextHint}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-surface-3 border border-border-default text-text-primary text-2xs font-medium hover:bg-surface-4 transition-all"
                  >
                    <Lightbulb size={12} className="text-accent-copper" />
                    Reveal Hint {currentHintLevel + 1}
                  </button>
                )}

                {/* Explicit Solution Reveal */}
                <div className="pt-2 border-t border-border-subtle">
                  {!isSolutionRevealed ? (
                    <button
                      onClick={() => setShowSolutionConfirm(true)}
                      className="w-full text-center text-3xs text-text-quaternary hover:text-text-tertiary underline py-1"
                    >
                      Need full solution? (Try hints first)
                    </button>
                  ) : (
                    <div className="bg-surface-2 border border-accent-green/30 rounded-[8px] p-3 space-y-2 animate-fade-in">
                      <div className="text-2xs font-semibold text-accent-green flex items-center gap-1">
                        <Check size={12} /> Solution Revealed
                      </div>
                      <pre className="font-mono text-3xs text-text-secondary bg-surface-0 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                        {problem.solutionCode?.[currentLanguage] || problem.structuredHints?.fullSolution || 'Solution available in solution tab.'}
                      </pre>
                      <button
                        onClick={() => {
                          const sol = problem.solutionCode?.[currentLanguage] || problem.structuredHints?.fullSolution;
                          if (sol) setEditorCode(sol);
                        }}
                        className="px-2.5 py-1 rounded-full bg-surface-4 text-text-primary text-3xs hover:bg-surface-3 transition-colors"
                      >
                        Copy into Editor
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostics Modal (Spec Section 12) */}
      <CodingEngineDiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />

      {/* Solution Confirmation Modal */}
      {showSolutionConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface-2 border border-border-default rounded-[12px] p-6 max-w-sm w-full space-y-4 animate-scale-up">
            <h4 className="text-sm font-semibold text-text-primary">Reveal Full Solution?</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              OM recommends trying Hints 1 through 5 first. Are you sure you want to reveal the complete code now?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSolutionConfirm(false)}
                className="px-4 py-1.5 rounded-full text-xs text-text-tertiary hover:text-text-primary"
              >
                Let me try more
              </button>
              <button
                onClick={() => {
                  setShowSolutionConfirm(false);
                  revealSolution();
                }}
                className="px-4 py-1.5 rounded-full bg-accent-copper text-white text-xs font-semibold"
              >
                Reveal Solution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Main CodingLab Page =====
export default function CodingLabPage() {
  const { labView, virtualContestDebrief, dismissDebrief } = useCodingLabStore();

  return (
    <>
      {labView === 'problem' ? <ProblemWorkspace /> : <CodingLabHome />}

      {/* Virtual Contest Debrief Modal (Phase 12) */}
      {virtualContestDebrief && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-surface-2 border border-border-default rounded-[12px] p-6 max-w-lg w-full space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-accent-copper" />
                <h3 className="text-base font-semibold text-text-primary">Contest Debrief</h3>
              </div>
              <button onClick={dismissDebrief} className="text-text-tertiary hover:text-text-primary text-xs">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-3 rounded-[8px] p-3 text-center">
                <div className="text-3xs uppercase tracking-wider text-text-tertiary">Solved</div>
                <div className="text-lg font-bold text-accent-green">
                  {virtualContestDebrief.solvedCount} / {virtualContestDebrief.totalProblems}
                </div>
              </div>
              <div className="bg-surface-3 rounded-[8px] p-3 text-center">
                <div className="text-3xs uppercase tracking-wider text-text-tertiary">Time Used</div>
                <div className="text-lg font-bold text-text-primary">
                  {Math.round(virtualContestDebrief.totalTimeSeconds / 60)}m
                </div>
              </div>
              <div className="bg-surface-3 rounded-[8px] p-3 text-center">
                <div className="text-3xs uppercase tracking-wider text-text-tertiary">Score</div>
                <div className="text-lg font-bold text-accent-copper">{virtualContestDebrief.totalScore}</div>
              </div>
            </div>

            {/* Weak topics & Recommended Revision */}
            {virtualContestDebrief.weakTopics.length > 0 ? (
              <div className="space-y-2">
                <div className="text-2xs uppercase tracking-wider text-text-tertiary font-semibold">
                  Identified Weak Topics
                </div>
                <div className="space-y-1.5">
                  {virtualContestDebrief.recommendedRevision.map((rev, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-[8px] bg-surface-3 border border-border-subtle">
                      <div>
                        <div className="text-xs font-medium text-text-primary">{rev.topic}</div>
                        <div className="text-3xs text-text-tertiary">{rev.reason}</div>
                      </div>
                      <span className="text-3xs px-2 py-0.5 rounded-full bg-accent-blue/15 text-accent-blue font-semibold">
                        Recommended
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-[8px] bg-accent-green/10 text-accent-green text-xs text-center font-medium">
                Perfect score! Zero weak topics detected in this contest.
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={dismissDebrief}
                className="px-5 py-2 rounded-full bg-white text-surface-0 text-xs font-semibold hover:bg-bone transition-all"
              >
                Close Debrief
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
