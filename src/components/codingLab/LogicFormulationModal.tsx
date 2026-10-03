import React, { useState } from 'react';
import {
  Brain, Lightbulb, Zap, AlertTriangle, Check, Copy, Play,
  Clock, Database, ArrowRight, BookOpen, Layers, X, ShieldCheck
} from 'lucide-react';
import type { CodingProblem } from '../../types/codingLab';
import { buildLogicGuide } from '../../utils/logicFormulationGuide';
import { soundManager } from '../../utils/soundManager';

interface LogicFormulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: CodingProblem;
  onInsertCode: (code: string) => void;
  onRunCode?: (code: string) => void;
}

export default function LogicFormulationModal({
  isOpen,
  onClose,
  problem,
  onInsertCode,
  onRunCode,
}: LogicFormulationModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const guide = buildLogicGuide(problem);

  const handleCopy = () => {
    navigator.clipboard.writeText(guide.fullPythonSolution);
    setCopied(true);
    soundManager.play('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    onInsertCode(guide.fullPythonSolution);
    soundManager.play('taskCompleted');
    onClose();
  };

  const handleInsertAndRun = () => {
    onInsertCode(guide.fullPythonSolution);
    soundManager.play('milestone');
    onClose();
    if (onRunCode) {
      setTimeout(() => onRunCode(guide.fullPythonSolution), 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-1 border border-border-default rounded-[12px] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent-copper/20 flex items-center justify-center text-accent-copper font-bold text-sm">
              ॐ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-text-primary">
                  Approach & Logic Formulation Guide
                </h3>
                <span className="text-3xs font-mono px-2 py-0.5 rounded-full bg-accent-copper/20 text-accent-copper border border-accent-copper/30">
                  {guide.patternType}
                </span>
              </div>
              <p className="text-2xs text-text-tertiary">
                Step-by-step pedagogical thinking for <strong className="text-text-secondary">{guide.title}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-3 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Stepper */}
        <div className="flex items-center gap-1 px-4 py-2 bg-surface-2 border-b border-border-subtle overflow-x-auto no-scrollbar shrink-0 text-2xs font-mono">
          {[
            { num: 1, label: '1. Decode & Constraints' },
            { num: 2, label: '2. Brute Force & TLE' },
            { num: 3, label: '3. Pattern Discovery' },
            { num: 4, label: '4. Step Logic' },
            { num: 5, label: '5. Full Solution (sys.stdin)' },
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                activeStep === s.num
                  ? 'bg-accent-copper text-black font-bold shadow-sm'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface-3'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-text-secondary">
          {/* STEP 1: DECODE & CONSTRAINTS */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-[10px] bg-surface-2 border border-border-default space-y-2">
                <div className="flex items-center gap-1.5 text-accent-blue font-semibold text-2xs uppercase tracking-wider">
                  <BookOpen size={14} /> Step 1: Decode Problem Intent
                </div>
                <p className="text-text-primary text-sm leading-relaxed">
                  {guide.coreQuestion}
                </p>
              </div>

              <div className="p-4 rounded-[10px] bg-accent-copper/10 border border-accent-copper/30 space-y-2">
                <div className="flex items-center gap-1.5 text-accent-copper font-semibold text-2xs uppercase tracking-wider">
                  <ShieldCheck size={14} /> Constraints Analysis & Speed Budget
                </div>
                <p className="text-text-primary text-xs leading-relaxed">
                  {guide.constraintsAnalysis}
                </p>
                <div className="p-2.5 rounded-[8px] bg-surface-0 border border-border-subtle text-3xs font-mono text-text-tertiary">
                  <strong className="text-accent-copper">OM Golden Rule of Constraints:</strong>
                  <br />• N ≤ 10^4 → O(N^2) might squeak by, but risky.
                  <br />• N ≤ 10^5 → O(N) or O(N log N) MANDATORY (~10^7 ops max in 1.0s).
                  <br />• N ≤ 10^9 → O(log N) or O(√N) Binary Search on Answer required!
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary text-2xs font-semibold border border-border-default transition-all"
                >
                  Next: Why Brute Force Fails <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BRUTE FORCE & WHY IT FAILS */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-[10px] bg-accent-red/10 border border-accent-red/30 space-y-2">
                <div className="flex items-center gap-1.5 text-accent-red font-semibold text-2xs uppercase tracking-wider">
                  <AlertTriangle size={14} /> Step 2: The Beginner Brute Force Attempt
                </div>
                <p className="text-text-primary text-xs leading-relaxed">
                  {guide.bruteForceExplanation}
                </p>
                <div className="text-2xs font-mono text-accent-red font-semibold">
                  Brute Force Complexity: {guide.bruteForceComplexity}
                </div>
              </div>

              <div className="p-4 rounded-[10px] bg-surface-2 border border-border-default space-y-2">
                <div className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Why Brute Force Fails (The Bottleneck)
                </div>
                <p className="text-text-primary text-xs leading-relaxed">
                  {guide.whyBruteForceFails}
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-1.5 rounded-full text-2xs text-text-tertiary hover:text-text-primary"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary text-2xs font-semibold border border-border-default transition-all"
                >
                  Next: Pattern Discovery <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PATTERN DISCOVERY */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-[10px] bg-accent-green/10 border border-accent-green/30 space-y-2.5">
                <div className="flex items-center gap-1.5 text-accent-green font-semibold text-2xs uppercase tracking-wider">
                  <Zap size={14} /> Step 3: The Breakthrough Observation
                </div>
                <p className="text-text-primary text-xs leading-relaxed font-medium">
                  {guide.coreObservation}
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-accent-green/20 text-accent-green font-mono text-2xs font-bold border border-accent-green/40">
                  Pattern Selected: {guide.patternType}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-1.5 rounded-full text-2xs text-text-tertiary hover:text-text-primary"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setActiveStep(4)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary text-2xs font-semibold border border-border-default transition-all"
                >
                  Next: Step-by-Step Logic <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: STEP-BY-STEP LOGIC */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-[10px] bg-surface-2 border border-border-default space-y-3">
                <div className="flex items-center gap-1.5 text-accent-copper font-semibold text-2xs uppercase tracking-wider">
                  <Layers size={14} /> Step 4: Step-by-Step Logic & Invariant Construction
                </div>
                <div className="space-y-2 font-mono text-2xs leading-relaxed text-text-primary">
                  {guide.stepByStepLogic.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-[8px] bg-surface-3 border border-border-subtle flex items-start gap-2">
                      <span className="text-accent-copper font-bold">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-2xs font-mono">
                <div className="p-3 rounded-[8px] bg-surface-2 border border-border-subtle">
                  <div className="text-text-tertiary uppercase text-3xs">Target Time Complexity</div>
                  <div className="text-accent-green font-bold text-xs mt-0.5">{guide.timeComplexity}</div>
                </div>
                <div className="p-3 rounded-[8px] bg-surface-2 border border-border-subtle">
                  <div className="text-text-tertiary uppercase text-3xs">Target Space Complexity</div>
                  <div className="text-accent-blue font-bold text-xs mt-0.5">{guide.spaceComplexity}</div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep(3)}
                  className="px-4 py-1.5 rounded-full text-2xs text-text-tertiary hover:text-text-primary"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setActiveStep(5)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent-copper text-black font-semibold text-2xs hover:bg-accent-copper/90 transition-all shadow-sm"
                >
                  View Full Solution (sys.stdin) <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: FULL PYTHON SOLUTION WITH sys.stdin.read().split() */}
          {activeStep === 5 && (
            <div className="space-y-4 animate-fade-in">
              {/* Why sys.stdin.read().split() explanation callout */}
              <div className="p-3.5 rounded-[10px] bg-accent-blue/10 border border-accent-blue/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-accent-blue font-semibold text-2xs uppercase tracking-wider">
                  <Brain size={14} /> Why We Use sys.stdin.read().split()
                </div>
                <p className="text-2xs text-text-secondary leading-relaxed">
                  <strong className="text-text-primary font-semibold">Token-based parsing:</strong>{' '}
                  {guide.stdinExplanation}{' '}
                  Unlike standard <code className="bg-surface-3 px-1 py-0.5 rounded text-accent-copper">input()</code> which crashes with <code className="bg-surface-3 px-1 py-0.5 rounded text-accent-red">EOFError</code> on extra/missing newlines, <code className="bg-surface-3 px-1 py-0.5 rounded text-accent-green">sys.stdin.read().split()</code> reads the whole input stream into an array of words/numbers, ensuring 100% reliable execution in real compiler evaluations.
                </p>
              </div>

              {/* Code Box */}
              <div className="relative rounded-[10px] border border-border-default bg-[#181818] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-surface-3 text-2xs font-mono">
                  <span className="text-text-tertiary">Python 3 (Full Standalone Solution)</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-4 hover:bg-surface-2 text-text-primary text-3xs transition-colors"
                    >
                      {copied ? <Check size={11} className="text-accent-green" /> : <Copy size={11} />}
                      {copied ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                </div>

                <pre className="p-4 font-mono text-2xs text-text-primary overflow-x-auto max-h-72 leading-relaxed">
                  {guide.fullPythonSolution}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                <button
                  onClick={() => setActiveStep(4)}
                  className="px-4 py-1.5 rounded-full text-2xs text-text-tertiary hover:text-text-primary"
                >
                  ← Step Logic
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInsert}
                    className="flex items-center gap-1 px-4 py-2 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary text-2xs font-semibold border border-border-default transition-all"
                  >
                    Copy into Editor
                  </button>
                  {onRunCode && (
                    <button
                      onClick={handleInsertAndRun}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent-green text-surface-0 font-semibold text-2xs hover:bg-accent-green/90 transition-all shadow-sm"
                    >
                      <Play size={12} /> Insert & Run Real Python
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
