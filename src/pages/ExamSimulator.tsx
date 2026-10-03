import React, { useState, useEffect, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import {
  Clock, Play, Send, AlertTriangle, CheckCircle2, XCircle, ShieldAlert,
  Sparkles, RotateCcw, BookOpen, ChevronRight, Terminal, Award, HelpCircle,
  Code2, ExternalLink
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { executeCode } from '../utils/codeExecutionService';
import type { ExamQuestion, ExamSubmissionRecord } from '../types';

export default function ExamSimulatorPage() {
  const {
    activeExamSession,
    startExamSession,
    setExamActiveQuestion,
    updateExamCode,
    updateExamCustomInput,
    recordExamSubmission,
    updateExamRemainingSeconds,
    completeExamSession,
    resetExamSession,
    setCurrentPage,
  } = useAppStore();

  const [isRunningCustom, setIsRunningCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customOutput, setCustomOutput] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'input' | 'output' | 'results'>('input');
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  // Timer countdown hook
  useEffect(() => {
    if (!activeExamSession || activeExamSession.status !== 'in_progress') return;

    const interval = setInterval(() => {
      const remaining = activeExamSession.remainingSeconds - 1;
      if (remaining <= 0) {
        clearInterval(interval);
        updateExamRemainingSeconds(0);
        completeExamSession();
      } else {
        updateExamRemainingSeconds(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExamSession?.status, activeExamSession?.remainingSeconds]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeExamSession || activeExamSession.status === 'not_started') {
    return (
      <div className="h-full overflow-y-auto px-4 sm:px-8 py-8 max-w-4xl mx-auto w-full flex flex-col justify-center">
        {/* Exam Start Screen */}
        <div className="p-8 sm:p-10 rounded-[10px] bg-carbon border border-border/60 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper/10 border border-copper/30 text-copper text-xs font-mono tracking-wider uppercase mb-4">
            <Clock className="w-3.5 h-3.5" />
            90-Minute Timed Mock
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-text-primary tracking-tight mb-3">
            CODING SKILLS EVALUATION
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto mb-6">
            “90 minutes. 3 questions. Think before you code.”
          </p>

          {/* Known facts only */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-6 text-left">
            <div className="p-3.5 rounded-[10px] bg-graphite/40 border border-border/40">
              <span className="text-[10px] font-mono uppercase text-text-tertiary block">Duration</span>
              <span className="text-base font-semibold text-text-primary mt-0.5 block font-mono">90:00 Minutes</span>
            </div>
            <div className="p-3.5 rounded-[10px] bg-graphite/40 border border-border/40">
              <span className="text-[10px] font-mono uppercase text-text-tertiary block">Questions</span>
              <span className="text-base font-semibold text-text-primary mt-0.5 block font-mono">3 Original Tasks</span>
            </div>
            <div className="p-3.5 rounded-[10px] bg-graphite/40 border border-border/40">
              <span className="text-[10px] font-mono uppercase text-text-tertiary block">Environment</span>
              <span className="text-base font-semibold text-text-primary mt-0.5 block font-mono">Python 3 (Real)</span>
            </div>
          </div>

          {/* Syllabus */}
          <div className="p-4 rounded-[10px] bg-graphite/20 border border-border/30 max-w-xl mx-auto mb-6 text-left">
            <span className="text-xs font-mono uppercase tracking-wider text-text-tertiary block mb-2">
              EXACT EVALUATION SYLLABUS (ONLY 5 TOPICS):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Prefix Technique',
                'Two Pointers (All 3 Forms)',
                'HashMap',
                'Binary Search',
                '2D Array',
              ].map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-full text-xs font-mono bg-copper/10 border border-copper/20 text-copper"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Strict AI restriction notice */}
          <div className="p-3.5 rounded-[10px] bg-amber-500/10 border border-amber-500/20 max-w-xl mx-auto mb-8 text-left flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 font-semibold block mb-0.5">Strict Examination Conditions:</strong>
              OM is completely unavailable for hints, approaches, and contextual code suggestions during the mock exam.
              Only neutral test execution feedback is provided. Post-exam debrief will unlock upon submission.
            </div>
          </div>

          <button
            onClick={startExamSession}
            className="px-8 py-3 rounded-full bg-copper text-black font-semibold text-sm hover:bg-copper/90 transition-all shadow-md active:scale-95"
          >
            START 90-MINUTE EXAM
          </button>
        </div>
      </div>
    );
  }

  // COMPLETED VIEW: POST-EXAM DEBRIEF & CONCEPT REVEAL
  if (activeExamSession.status === 'completed' && activeExamSession.debrief) {
    const { debrief } = activeExamSession;

    return (
      <div className="h-full overflow-y-auto px-4 sm:px-8 py-8 max-w-5xl mx-auto w-full">
        <div className="p-6 sm:p-8 rounded-[10px] bg-carbon border border-border/60 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Session Finished
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-semibold text-text-primary">
                EXAM COMPLETE — PERFORMANCE DEBRIEF
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                OM has analyzed your submissions. Review the hidden concept breakdown to master pattern recognition.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetExamSession}
                className="px-4 py-2 rounded-full border border-border/60 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Retake Mock Exam
              </button>
              <button
                onClick={() => setCurrentPage('sirsheet')}
                className="px-4 py-2 rounded-full bg-copper text-black font-semibold text-xs hover:bg-copper/90 transition-colors"
              >
                Sir's Practice Sheet
              </button>
            </div>
          </div>

          {/* Stats Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="p-4 rounded-[10px] bg-graphite/40 border border-border/40">
              <span className="text-xs text-text-tertiary uppercase font-mono block">Solved</span>
              <span className="text-2xl font-display font-semibold text-emerald-400 mt-1 block">
                {debrief.solvedCount} / {activeExamSession.questions.length}
              </span>
            </div>
            <div className="p-4 rounded-[10px] bg-graphite/40 border border-border/40">
              <span className="text-xs text-text-tertiary uppercase font-mono block">Time Spent</span>
              <span className="text-2xl font-display font-semibold text-text-primary mt-1 block font-mono">
                {formatTime(debrief.timeSpentSeconds)}
              </span>
            </div>
            <div className="p-4 rounded-[10px] bg-graphite/40 border border-border/40">
              <span className="text-xs text-text-tertiary uppercase font-mono block">Errors Encountered</span>
              <span className="text-2xl font-display font-semibold text-amber-400 mt-1 block font-mono">
                {debrief.runtimeErrors + debrief.compilationErrors + debrief.wrongAnswers}
              </span>
            </div>
            <div className="p-4 rounded-[10px] bg-graphite/40 border border-border/40">
              <span className="text-xs text-text-tertiary uppercase font-mono block">AI Hints Used</span>
              <span className="text-2xl font-display font-semibold text-text-muted mt-1 block font-mono">
                0 (Strict Mode)
              </span>
            </div>
          </div>

          {/* POST-EXAM CONCEPT REVEAL */}
          <div className="space-y-4 mb-8">
            <h2 className="text-sm font-mono uppercase tracking-wider text-text-tertiary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-copper" />
              POST-EXAM CONCEPT REVEAL & PATTERN BREAKDOWN
            </h2>

            {debrief.conceptBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-[10px] bg-graphite/30 border border-border/40 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-copper font-semibold">Q{idx + 1}:</span>
                    <h3 className="text-sm font-semibold text-text-primary">{item.questionTitle}</h3>
                    {item.isSolved ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        SOLVED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        UNSOLVED / INCOMPLETE
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {item.concepts.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-copper/15 text-copper border border-copper/30"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-[10px] bg-carbon border border-border/30 text-xs text-text-secondary leading-relaxed font-sans whitespace-pre-line">
                  {item.debriefText}
                </div>
              </div>
            ))}
          </div>

          {/* OM Recommendations */}
          <div className="p-5 rounded-[10px] bg-carbon border border-copper/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-copper font-semibold">
                OM MENTOR TARGETED ACTION PLAN
              </span>
            </div>
            <ul className="space-y-2 text-xs text-text-secondary">
              {debrief.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-copper font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE EXAM ENVIRONMENT
  const currentQIndex = activeExamSession.activeQuestionIndex;
  const currentQ = activeExamSession.questions[currentQIndex];
  const currentCode = activeExamSession.codes[currentQ.id] || currentQ.starterCode;
  const currentInput = activeExamSession.customInputs[currentQ.id] ?? currentQ.examples[0]?.input ?? '';
  const currentSub = activeExamSession.submissions[currentQ.id];

  // Remaining time warning indicators
  const isTimeCritical = activeExamSession.remainingSeconds <= 300; // 5 min
  const isTimeWarning = activeExamSession.remainingSeconds <= 900; // 15 min

  const handleRunCustom = async () => {
    setIsRunningCustom(true);
    setActiveConsoleTab('output');
    try {
      const result = await executeCode(currentCode, 'python', currentInput);
      setCustomOutput(result.stdout || '(No output produced)');
      setCustomError(result.stderr || null);
    } catch (err: any) {
      setCustomError(err?.message || 'Execution error');
    } finally {
      setIsRunningCustom(false);
    }
  };

  const handleSubmitQuestion = async () => {
    setIsSubmitting(true);
    setActiveConsoleTab('results');

    let passedCount = 0;
    let firstError: string | undefined;
    let finalStatus: ExamSubmissionRecord['status'] = 'passed';

    for (const tc of currentQ.testCases) {
      try {
        const result = await executeCode(currentCode, 'python', tc.input);
        const actual = (result.stdout || '').trim();
        const expected = tc.expectedOutput.trim();

        if (result.status === 'runtime_error' || result.status === 'compilation_error') {
          finalStatus = 'runtime_error';
          firstError = result.stderr || 'Runtime error during test execution';
          break;
        } else if (result.status === 'time_limit') {
          finalStatus = 'time_limit';
          firstError = 'Time limit exceeded on test case';
          break;
        } else if (actual === expected) {
          passedCount++;
        } else {
          finalStatus = 'wrong_answer';
          firstError = `Mismatch on test case. Expected '${expected}' but got '${actual}'`;
          break;
        }
      } catch (err: any) {
        finalStatus = 'runtime_error';
        firstError = err?.message || 'Execution failure';
        break;
      }
    }

    const record: ExamSubmissionRecord = {
      questionId: currentQ.id,
      code: currentCode,
      status: finalStatus,
      passedTests: passedCount,
      totalTests: currentQ.testCases.length,
      output: firstError || `Passed all ${passedCount} tests.`,
      error: firstError,
      submittedAt: new Date().toISOString(),
    };

    recordExamSubmission(currentQ.id, record);
    setIsSubmitting(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-onyx">
      {/* Top Exam Navigation Bar */}
      <header className="h-14 px-4 sm:px-6 bg-carbon border-b border-border/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-copper font-semibold">CODING SKILLS EVALUATION</span>
            <span className="text-xs text-text-tertiary hidden sm:inline">|</span>
            <span className="text-xs text-text-secondary hidden sm:inline">3 Questions</span>
          </div>

          {/* Question Navigator Pills */}
          <div className="flex items-center gap-1.5 ml-2">
            {activeExamSession.questions.map((q, idx) => {
              const sub = activeExamSession.submissions[q.id];
              const isSolved = sub?.status === 'passed' && sub.passedTests === sub.totalTests;
              const isAttempted = !!sub && !isSolved;
              const isActive = idx === currentQIndex;

              let badgeColor = 'bg-graphite/60 text-text-tertiary border-border/40';
              if (isSolved) badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
              else if (isAttempted) badgeColor = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';

              return (
                <button
                  key={q.id}
                  onClick={() => setExamActiveQuestion(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-medium border transition-all ${badgeColor} ${
                    isActive ? 'ring-2 ring-copper font-bold' : 'hover:border-text-secondary'
                  }`}
                >
                  Q{q.number}
                  {isSolved && ' ✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live 90-Min Countdown Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1 rounded-full border font-mono text-xs font-semibold ${
              isTimeCritical
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : isTimeWarning
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-graphite/60 text-text-primary border-border/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(activeExamSession.remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setShowConfirmEnd(true)}
            className="px-4 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
          >
            End Exam
          </button>
        </div>
      </header>

      {/* Main Split Layout: Left Problem, Right Editor & Console */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Problem Description */}
        <div className="w-full lg:w-5/12 h-1/2 lg:h-full overflow-y-auto p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-border/40 bg-carbon">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-graphite text-text-secondary border border-border/40">
              Question {currentQ.number} of 3
            </span>
            <span className="text-xs font-mono text-text-tertiary">
              Difficulty: <strong className="text-text-secondary">{currentQ.difficulty}</strong>
            </span>
          </div>

          <h2 className="text-xl font-display font-semibold text-text-primary mb-3">
            {currentQ.title}
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm text-text-secondary leading-relaxed mb-5 whitespace-pre-line font-sans">
            {currentQ.statement}
          </div>

          {/* Formats */}
          <div className="space-y-3 mb-5">
            <div className="p-3 rounded-[10px] bg-graphite/30 border border-border/30">
              <span className="text-[10px] font-mono uppercase text-text-tertiary block mb-1">Input Format:</span>
              <p className="text-xs text-text-secondary whitespace-pre-line font-mono">{currentQ.inputFormat}</p>
            </div>
            <div className="p-3 rounded-[10px] bg-graphite/30 border border-border/30">
              <span className="text-[10px] font-mono uppercase text-text-tertiary block mb-1">Output Format:</span>
              <p className="text-xs text-text-secondary whitespace-pre-line font-mono">{currentQ.outputFormat}</p>
            </div>
          </div>

          {/* Constraints */}
          <div className="mb-5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary block mb-2">
              Constraints:
            </span>
            <ul className="space-y-1">
              {currentQ.constraints.map((c, i) => (
                <li key={i} className="text-xs text-text-secondary font-mono">
                  • {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Examples */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary block">
              Sample Examples:
            </span>
            {currentQ.examples.map((ex, i) => (
              <div key={i} className="p-3 rounded-[10px] bg-graphite/40 border border-border/40 text-xs">
                <span className="text-text-tertiary font-mono block mb-1">Example {i + 1}:</span>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-text-muted text-[10px] block">Input</span>
                    <pre className="p-1.5 rounded bg-black/40 text-text-primary whitespace-pre-wrap">{ex.input}</pre>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] block">Output</span>
                    <pre className="p-1.5 rounded bg-black/40 text-emerald-400 whitespace-pre-wrap">{ex.output}</pre>
                  </div>
                </div>
                {ex.explanation && (
                  <p className="text-text-secondary text-[11px] mt-2 italic font-sans">{ex.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Monaco Code Editor & Bottom Console */}
        <div className="w-full lg:w-7/12 h-1/2 lg:h-full flex flex-col overflow-hidden bg-onyx">
          {/* Editor Header Toolbar */}
          <div className="h-10 px-4 bg-graphite/40 border-b border-border/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-copper font-medium">Python 3</span>
              <span className="text-[10px] text-text-tertiary">(Real Execution)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateExamCode(currentQ.id, currentQ.starterCode)}
                className="text-[11px] text-text-tertiary hover:text-text-secondary flex items-center gap-1 font-mono transition-colors"
                title="Reset to starter skeleton"
              >
                <RotateCcw className="w-3 h-3" /> Reset Starter
              </button>
            </div>
          </div>

          {/* Monaco Editor Pane */}
          <div className="flex-1 min-h-0 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language="python"
              value={currentCode}
              onChange={(val) => updateExamCode(currentQ.id, val || '')}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                lineNumbers: 'on',
                folding: true,
                padding: { top: 10 },
                renderLineHighlight: 'all',
              }}
            />
          </div>

          {/* Console / Action Toolbar */}
          <div className="h-44 sm:h-52 bg-carbon border-t border-border/40 flex flex-col shrink-0">
            {/* Console Tabs & Execution Buttons */}
            <div className="h-10 px-4 border-b border-border/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveConsoleTab('input')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    activeConsoleTab === 'input'
                      ? 'bg-copper text-black font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Custom Stdin
                </button>
                <button
                  onClick={() => setActiveConsoleTab('output')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    activeConsoleTab === 'output'
                      ? 'bg-copper text-black font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Run Output
                </button>
                <button
                  onClick={() => setActiveConsoleTab('results')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    activeConsoleTab === 'results'
                      ? 'bg-copper text-black font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Submit Status
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={isRunningCustom || isSubmitting}
                  onClick={handleRunCustom}
                  className="px-4 py-1.5 rounded-full text-xs font-mono font-medium border border-border/60 hover:border-text-primary text-text-primary transition-all flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Play className="w-3 h-3 text-copper" />
                  {isRunningCustom ? 'Running...' : 'Run Code'}
                </button>

                <button
                  disabled={isRunningCustom || isSubmitting}
                  onClick={handleSubmitQuestion}
                  className="px-5 py-1.5 rounded-full text-xs font-semibold bg-copper text-black hover:bg-copper/90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-40"
                >
                  <Send className="w-3 h-3" />
                  {isSubmitting ? 'Evaluating...' : 'Submit Question'}
                </button>
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 min-h-0 p-3 overflow-y-auto font-mono text-xs bg-onyx/80">
              {activeConsoleTab === 'input' && (
                <div className="h-full flex flex-col">
                  <span className="text-[10px] text-text-tertiary mb-1 font-sans">
                    Custom standard input (stdin):
                  </span>
                  <textarea
                    value={currentInput}
                    onChange={(e) => updateExamCustomInput(currentQ.id, e.target.value)}
                    placeholder="Enter custom stdin here..."
                    className="flex-1 w-full p-2 bg-graphite/30 border border-border/40 rounded-[6px] text-text-primary resize-none focus:outline-none focus:border-copper/60 font-mono text-xs"
                  />
                </div>
              )}

              {activeConsoleTab === 'output' && (
                <div className="space-y-2">
                  {customError && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
                      <span className="font-semibold block mb-0.5">Stderr / Error:</span>
                      <pre className="whitespace-pre-wrap">{customError}</pre>
                    </div>
                  )}
                  {customOutput && (
                    <div>
                      <span className="text-text-tertiary block mb-0.5">Stdout:</span>
                      <pre className="whitespace-pre-wrap text-text-primary">{customOutput}</pre>
                    </div>
                  )}
                  {!customOutput && !customError && (
                    <span className="text-text-tertiary italic">Click 'Run Code' to test with custom stdin.</span>
                  )}
                </div>
              )}

              {activeConsoleTab === 'results' && (
                <div>
                  {currentSub ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {currentSub.status === 'passed' && currentSub.passedTests === currentSub.totalTests ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accepted ({currentSub.passedTests}/{currentSub.totalTests} tests passed)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                            <XCircle className="w-4 h-4" />
                            <span>
                              {currentSub.status.toUpperCase()} ({currentSub.passedTests}/{currentSub.totalTests} tests passed)
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-text-secondary whitespace-pre-wrap">{currentSub.output}</p>
                      <span className="text-[10px] text-text-tertiary block">
                        Submitted at: {new Date(currentSub.submittedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-text-tertiary italic">
                      No submission recorded yet for Q{currentQ.number}. Click 'Submit Question' to run official tests.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm End Modal */}
      {showConfirmEnd && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="p-6 rounded-[10px] bg-carbon border border-border/80 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-text-primary">End Exam Simulation?</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to finish and submit your exam now? Your submissions will be locked and OM will reveal the hidden pattern debrief.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmEnd(false)}
                className="px-4 py-1.5 rounded-full text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Continue Exam
              </button>
              <button
                onClick={() => {
                  setShowConfirmEnd(false);
                  completeExamSession();
                }}
                className="px-5 py-1.5 rounded-full bg-rose-500 text-white font-semibold text-xs hover:bg-rose-600 transition-colors"
              >
                Yes, Finish & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
