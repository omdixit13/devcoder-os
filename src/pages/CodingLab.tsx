import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play, Square, RotateCcw, ChevronRight, Terminal, CheckCircle2,
  XCircle, Clock, AlertTriangle, Lightbulb, Code2, ArrowLeft,
  BookOpen, Zap, Timer, FileCode, ChevronDown, Send, Cpu,
  Sparkles, ShieldAlert, Compass, RefreshCw, Trophy, Flag, Eye,
  Lock, ArrowUpRight, HelpCircle, Layers, Check, Copy, Flame
} from 'lucide-react';
import { useCodingLabStore } from '../store/useCodingLabStore';
import { useAppStore } from '../store/useAppStore';
import { LANGUAGE_CONFIGS } from '../utils/codeExecutionService';
import type { SupportedLanguage, ProblemDifficulty, CodingAttempt } from '../types/codingLab';
import { soundManager } from '../utils/soundManager';
import {
  analyzeCodeComplexity,
  analyzeExecutionFailure,
  checkRepeatedMistakes,
  getStructuredHint,
} from '../utils/bhaiCodingCoach';

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
    topicFilter, difficultyFilter, setTopicFilter, setDifficultyFilter,
    startVirtualContest, getRecommendation,
  } = useCodingLabStore();

  const [search, setSearch] = useState('');
  const [showContestModal, setShowContestModal] = useState(false);
  const [contestDuration, setContestDuration] = useState(60);

  const recommendation = useMemo(() => getRecommendation(), [attempts]);

  const allTopics = useMemo(() => {
    const topicSet = new Set<string>();
    problems.forEach(p => p.topics.forEach(t => topicSet.add(t)));
    return ['All', ...Array.from(topicSet).sort()];
  }, [problems]);

  const filtered = useMemo(() => {
    let result = [...problems];
    if (topicFilter !== 'All') result = result.filter(p => p.topics.includes(topicFilter));
    if (difficultyFilter !== 'All') result = result.filter(p => p.difficulty === difficultyFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) || p.topics.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [problems, topicFilter, difficultyFilter, search]);

  const getLastAttempt = (problemId: string) =>
    attempts.find(a => a.problemId === problemId);

  const solvedCount = useMemo(() => {
    const solvedIds = new Set(attempts.filter(a => a.status === 'passed').map(a => a.problemId));
    return solvedIds.size;
  }, [attempts]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header / Hero */}
        <div className="flex items-start justify-between">
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold text-text-primary mb-1 flex items-center gap-2">
              <Terminal size={24} className="text-accent-blue" />
              Coding Lab
            </h1>
            <p className="text-sm text-text-tertiary">Practice. Run. Debug. Improve.</p>
          </div>
          <button
            onClick={() => setShowContestModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-copper/15 border border-accent-copper/30 text-accent-copper text-xs font-medium hover:bg-accent-copper/25 transition-all shadow-sm"
          >
            <Trophy size={14} />
            Virtual Contest
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-2 border border-border-default rounded-[10px] p-4">
            <div className="text-2xs text-text-tertiary uppercase tracking-wider mb-1">Solved</div>
            <div className="text-xl font-semibold text-accent-green">{solvedCount}</div>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-[10px] p-4">
            <div className="text-2xs text-text-tertiary uppercase tracking-wider mb-1">Attempted</div>
            <div className="text-xl font-semibold text-text-primary">
              {new Set(attempts.map(a => a.problemId)).size}
            </div>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-[10px] p-4">
            <div className="text-2xs text-text-tertiary uppercase tracking-wider mb-1">Total Problems</div>
            <div className="text-xl font-semibold text-text-secondary">{problems.length}</div>
          </div>
        </div>

        {/* Personalized Next Problem Card */}
        {recommendation && (
          <div className="bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 border border-accent-blue/30 rounded-[10px] p-5 relative overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-accent-blue flex items-center gap-1">
                    <Sparkles size={12} /> Bhai's Next Recommendation
                  </span>
                  <DiffBadge d={recommendation.problem.difficulty} />
                </div>
                <h3 className="text-base font-semibold text-text-primary">{recommendation.problem.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{recommendation.reason}</p>
              </div>
              <button
                onClick={() => selectProblem(recommendation.problem.id)}
                className="shrink-0 px-4 py-2 rounded-full bg-white text-surface-0 text-xs font-semibold hover:bg-bone transition-all flex items-center gap-1.5 shadow-sm"
              >
                Start Problem
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search problems by name or topic..."
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

        {/* Problem List */}
        <div className="space-y-1.5">
          {filtered.map(problem => {
            const lastAttempt = getLastAttempt(problem.id);
            return (
              <button
                key={problem.id}
                onClick={() => selectProblem(problem.id)}
                className="w-full flex items-center gap-3 bg-surface-2 border border-border-default rounded-[10px] p-4 hover:bg-surface-3 hover:border-border-strong transition-all group text-left"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  {lastAttempt ? (
                    <StatusIcon status={lastAttempt.status} />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-border-default" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary group-hover:text-white transition-colors truncate">
                    {problem.title}
                  </div>
                  <div className="text-2xs text-text-tertiary flex items-center gap-2 mt-0.5">
                    {problem.topics.slice(0, 3).map(t => (
                      <span key={t} className="text-text-quaternary">{t}</span>
                    ))}
                  </div>
                </div>
                <DiffBadge d={problem.difficulty} />
                <ChevronRight size={14} className="text-text-tertiary group-hover:text-text-secondary transition-colors" />
              </button>
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
              Virtual contest mode simulates real interview pressure with a strict countdown timer. Bhai hints and solutions are disabled during the contest.
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
  const [mobileTab, setMobileTab] = useState<'problem' | 'code' | 'bhai' | 'console'>('code');
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);

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
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border-default bg-surface-1 shrink-0">
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

        {/* Language selector */}
        <select
          value={currentLanguage}
          onChange={e => setLanguage(e.target.value as SupportedLanguage)}
          className="bg-surface-3 border border-border-default rounded-full px-3 py-1 text-2xs text-text-primary outline-none focus:border-border-strong cursor-pointer"
        >
          {availableLanguages.map(l => (
            <option key={l} value={l}>{LANGUAGE_CONFIGS[l].name}</option>
          ))}
        </select>
      </div>

      {/* Mobile Tab Switcher (Visible only on < lg screens) */}
      <div className="lg:hidden flex items-center justify-around border-b border-border-default bg-surface-2 p-1 shrink-0">
        {(['problem', 'code', 'bhai', 'console'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`px-3 py-1.5 text-2xs font-medium rounded-full capitalize transition-all ${
              mobileTab === tab ? 'bg-surface-4 text-text-primary' : 'text-text-tertiary'
            }`}
          >
            {tab === 'bhai' ? 'Bhai Coach' : tab}
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
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-text-primary">{problem.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <DiffBadge d={problem.difficulty} />
                {problem.topics.map(t => (
                  <span key={t} className="text-2xs px-2 py-0.5 rounded-full bg-surface-4 text-text-tertiary">{t}</span>
                ))}
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
          <div className="flex-1 min-h-0 bg-[#1e1e1e]">
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

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-t border-border-default bg-surface-1 shrink-0">
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
          <div className="h-56 border-t border-border-default bg-surface-1 shrink-0 overflow-hidden flex flex-col">
            {/* Console Tabs */}
            <div className="flex items-center gap-0 border-b border-border-subtle px-2 shrink-0 bg-surface-1">
              {(['output', 'testcases', 'custom', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setConsoleTab(tab)}
                  className={`px-3 py-2 text-2xs font-medium transition-colors border-b-2 capitalize ${
                    consoleTab === tab
                      ? 'text-text-primary border-accent-blue font-semibold'
                      : 'text-text-tertiary border-transparent hover:text-text-secondary'
                  }`}
                >
                  {tab === 'output' ? 'Terminal Output' :
                   tab === 'testcases' ? `Test Results (${testResults.length})` :
                   tab === 'custom' ? 'Custom Stdin' :
                   `Attempts History (${attempts.filter(a => a.problemId === problem.id).length})`}
                </button>
              ))}
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-3 bg-surface-0 font-mono text-2xs">
              {consoleTab === 'output' && (
                <div className="space-y-2">
                  {executionResult ? (
                    <>
                      {executionResult.compilationError && (
                        <div className="text-accent-red whitespace-pre-wrap p-2.5 rounded bg-accent-red/10 border border-accent-red/20">
                          <span className="font-semibold">Compilation Error:\n</span>
                          {executionResult.compilationError}
                        </div>
                      )}
                      {executionResult.stdout && (
                        <div className="text-text-primary whitespace-pre-wrap p-2 rounded bg-surface-2">{executionResult.stdout}</div>
                      )}
                      {executionResult.stderr && !executionResult.compilationError && (
                        <div className="text-accent-red whitespace-pre-wrap p-2 rounded bg-accent-red/10">{executionResult.stderr}</div>
                      )}
                      {!executionResult.stdout && !executionResult.stderr && !executionResult.compilationError && (
                        <div className="text-text-quaternary italic">Process exited with code 0 (No stdout).</div>
                      )}
                    </>
                  ) : (
                    <div className="text-text-quaternary italic py-4">
                      Click Run or Submit to see execution output.
                    </div>
                  )}
                </div>
              )}

              {consoleTab === 'testcases' && (
                <div className="space-y-2 font-sans">
                  {testResults.length > 0 ? (
                    testResults.map((tr, i) => (
                      <div
                        key={tr.testCaseId}
                        className={`rounded-[8px] border p-3 text-2xs ${
                          tr.passed
                            ? 'border-accent-green/20 bg-accent-green/5'
                            : 'border-accent-red/20 bg-accent-red/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5 font-semibold">
                          {tr.passed ? (
                            <CheckCircle2 size={12} className="text-accent-green" />
                          ) : (
                            <XCircle size={12} className="text-accent-red" />
                          )}
                          <span className="text-text-primary">
                            {tr.isHidden ? `Hidden Test Case #${i + 1}` : `Test Case ${i + 1}`}
                          </span>
                          <span className="text-text-quaternary font-mono">({tr.executionTimeMs}ms)</span>
                        </div>
                        <div className="font-mono space-y-1">
                          {!tr.isHidden ? (
                            <>
                              <div><span className="text-text-tertiary">Input: </span><span className="text-text-secondary whitespace-pre-wrap">{tr.input}</span></div>
                              <div><span className="text-text-tertiary">Expected: </span><span className="text-accent-green whitespace-pre-wrap">{tr.expectedOutput}</span></div>
                              <div><span className="text-text-tertiary">Got: </span><span className={tr.passed ? 'text-text-primary' : 'text-accent-red'}>{tr.actualOutput || '(empty)'}</span></div>
                            </>
                          ) : (
                            <div>
                              <span className="text-text-quaternary italic">Hidden test case used for judging.</span>
                              {!tr.passed && (
                                <div className="text-accent-red mt-1">Failed on expected output check.</div>
                              )}
                            </div>
                          )}
                          {tr.error && (
                            <div className="text-accent-red mt-1">{tr.error}</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-text-quaternary italic py-4">
                      Run or Submit to view test results.
                    </div>
                  )}
                </div>
              )}

              {consoleTab === 'custom' && (
                <div className="space-y-2 font-sans">
                  <textarea
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="Enter custom input (stdin) to test your code with specific arguments..."
                    className="w-full h-24 bg-surface-2 border border-border-default rounded-[8px] p-3 font-mono text-2xs text-text-primary outline-none focus:border-border-strong resize-none"
                  />
                  <button
                    onClick={() => runCode(customInput)}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-green/10 text-accent-green text-xs font-medium hover:bg-accent-green/20 transition-colors disabled:opacity-40"
                  >
                    <Play size={12} /> Run with Custom Input
                  </button>
                </div>
              )}

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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => restoreAttemptCode(att.code)}
                          className="px-2.5 py-1 rounded-full bg-surface-4 text-text-secondary text-2xs hover:text-text-primary transition-colors"
                        >
                          Restore Code
                        </button>
                      </div>
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

        {/* RIGHT: Bhai Coding Coach Panel */}
        <div
          className={`shrink-0 border-l border-border-default overflow-y-auto bg-surface-1 w-full lg:w-[320px] xl:w-[350px] ${
            mobileTab !== 'bhai' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-copper/20 flex items-center justify-center text-accent-copper font-bold text-xs">
                  भ
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Bhai Coding Coach</h3>
              </div>
              <span className="text-3xs text-accent-copper uppercase font-semibold tracking-wider">
                {mode === 'learning' ? 'Active Guide' : 'Contest Locked'}
              </span>
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

            {/* Repeated Mistake Pattern Alert (Phase 8) */}
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
                    onClick={() => {
                      setLabView('home');
                    }}
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

            {/* Error Guidance if Execution Failed */}
            {failureAdvice && mode === 'learning' && (
              <div className="bg-surface-2 border border-border-default rounded-[10px] p-3 space-y-1.5 animate-fade-in">
                <div className="text-2xs font-semibold text-text-primary flex items-center gap-1">
                  <HelpCircle size={12} className="text-accent-blue" />
                  {failureAdvice.headline}
                </div>
                <p className="text-2xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {failureAdvice.message}
                </p>
              </div>
            )}

            {/* Progressive Hints (Levels 1 to 4) - Learning Mode Only */}
            {mode === 'learning' && (
              <div className="space-y-3 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Progressive Hints ({currentHintLevel}/4)
                  </span>
                  {currentHintLevel > 0 && (
                    <button onClick={resetHints} className="text-3xs text-text-quaternary hover:text-text-tertiary">
                      Reset
                    </button>
                  )}
                </div>

                {/* Render Unlocked Hints */}
                <div className="space-y-2">
                  {[1, 2, 3, 4].slice(0, currentHintLevel).map(lvl => {
                    const hintData = getStructuredHint(problem, lvl);
                    if (!hintData) return null;
                    return (
                      <div key={lvl} className="bg-surface-2 border border-border-subtle rounded-[8px] p-3 text-2xs space-y-1 animate-fade-in">
                        <div className="font-semibold text-accent-copper text-3xs uppercase tracking-wide">
                          {hintData.levelTitle}
                        </div>
                        <div className="text-text-secondary whitespace-pre-wrap font-mono text-2xs">
                          {hintData.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reveal Next Hint Button */}
                {currentHintLevel < 4 && (
                  <button
                    onClick={revealNextHint}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-surface-3 border border-border-default text-text-primary text-2xs font-medium hover:bg-surface-4 transition-all"
                  >
                    <Lightbulb size={12} className="text-accent-copper" />
                    Reveal Hint {currentHintLevel + 1}
                  </button>
                )}

                {/* Explicit Solution Reveal (Phase 5) */}
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

      {/* Solution Confirmation Modal */}
      {showSolutionConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface-2 border border-border-default rounded-[12px] p-6 max-w-sm w-full space-y-4 animate-scale-up">
            <h4 className="text-sm font-semibold text-text-primary">Reveal Full Solution?</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Bhai recommends trying Hints 1 through 4 first. Are you sure you want to reveal the complete code now?
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
