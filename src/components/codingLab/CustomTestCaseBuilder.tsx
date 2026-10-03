import React, { useState } from 'react';
import { Play, Plus, Trash2, CheckCircle2, XCircle, Sparkles, Brain, AlertCircle } from 'lucide-react';
import { executeCode } from '../../utils/codeExecutionService';
import type { SupportedLanguage } from '../../types/codingLab';
import { soundManager } from '../../utils/soundManager';
import { getMentorAddress } from '../../utils/mentorPersonalization';
import { authService } from '../../services/authService';

export type TestCaseCategory = 'NORMAL' | 'BOUNDARY' | 'EDGE CASE' | 'DUPLICATE' | 'MINIMUM' | 'SPECIAL CASE';

export interface CustomTestCase {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  description: string;
  category: TestCaseCategory;
}

interface CustomTestCaseBuilderProps {
  editorCode: string;
  currentLanguage: SupportedLanguage;
  problemTitle: string;
}

const CATEGORIES: TestCaseCategory[] = [
  'NORMAL',
  'BOUNDARY',
  'EDGE CASE',
  'DUPLICATE',
  'MINIMUM',
  'SPECIAL CASE',
];

const categoryPillStyles: Record<TestCaseCategory, string> = {
  NORMAL: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
  BOUNDARY: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/30',
  'EDGE CASE': 'bg-accent-red/15 text-accent-red border-accent-red/30',
  DUPLICATE: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  MINIMUM: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'SPECIAL CASE': 'bg-accent-copper/15 text-accent-copper border-accent-copper/30',
};

const categoryExplanations: Record<TestCaseCategory, string> = {
  NORMAL: 'Checks the typical expected input range to confirm the core algorithm logic works smoothly under normal conditions.',
  BOUNDARY: 'Checks values at the extreme limits of the problem constraints (e.g. maximum N = 10^5 or max integer values).',
  'EDGE CASE': 'Checks unusual conditions such as negative numbers, zero targets, or empty lists where standard assumptions break down.',
  DUPLICATE: 'Verifies whether your solution correctly handles repeated values without skipping pointers or over-counting.',
  MINIMUM: 'Checks base input sizes (e.g. N = 1 or N = 2) to ensure edge checks and pointer initializations do not crash.',
  'SPECIAL CASE': 'Checks problem-specific tricky arrangements like reverse-sorted arrays, all identical elements, or alternating parity.',
};

export default function CustomTestCaseBuilder({
  editorCode,
  currentLanguage,
  problemTitle,
}: CustomTestCaseBuilderProps) {
  const [testCases, setTestCases] = useState<CustomTestCase[]>([
    {
      id: 'tc-1',
      name: 'TEST CASE 1',
      input: '5\n2 4 1 7 3\n12',
      expectedOutput: '12',
      description: 'Standard positive integer array test',
      category: 'NORMAL',
    },
    {
      id: 'tc-2',
      name: 'TEST CASE 2',
      input: '2\n-5 5\n0',
      expectedOutput: '0',
      description: 'Negative elements boundary test',
      category: 'BOUNDARY',
    },
    {
      id: 'tc-3',
      name: 'TEST CASE 3',
      input: '1\n42\n42',
      expectedOutput: '42',
      description: 'Minimum size single element case',
      category: 'MINIMUM',
    },
  ]);

  const [activeTab, setActiveTab] = useState<string>('tc-1');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Record<string, {
    passed: boolean;
    actualOutput: string;
    stderr: string;
    executionTimeMs: number;
  }>>({});

  const currentUser = authService.getCurrentUser();
  const mentorSalutation = getMentorAddress(currentUser, 'hint');

  const activeTC = testCases.find(tc => tc.id === activeTab) || testCases[0];

  const updateActiveTC = (updates: Partial<CustomTestCase>) => {
    setTestCases(prev => prev.map(tc => tc.id === activeTab ? { ...tc, ...updates } : tc));
  };

  const handleAddTestCase = () => {
    const nextNum = testCases.length + 1;
    const newId = `tc-${Date.now()}`;
    const newTC: CustomTestCase = {
      id: newId,
      name: `TEST CASE ${nextNum}`,
      input: '',
      expectedOutput: '',
      description: `Custom test #${nextNum}`,
      category: 'EDGE CASE',
    };
    setTestCases(prev => [...prev, newTC]);
    setActiveTab(newId);
    soundManager.play('click');
  };

  const handleDeleteTestCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (testCases.length <= 1) return;
    const filtered = testCases.filter(tc => tc.id !== id);
    setTestCases(filtered);
    if (activeTab === id) {
      setActiveTab(filtered[0].id);
    }
  };

  const handleRunTestCase = async () => {
    if (!activeTC) return;
    setIsRunning(true);
    soundManager.play('click');

    try {
      const res = await executeCode(editorCode, currentLanguage, activeTC.input);
      const actual = res.stdout.trim();
      const expected = activeTC.expectedOutput.trim();
      const passed = expected.length > 0 ? (actual === expected && res.status === 'passed') : res.status === 'passed';

      setResults(prev => ({
        ...prev,
        [activeTC.id]: {
          passed,
          actualOutput: actual,
          stderr: res.stderr || '',
          executionTimeMs: res.executionTimeMs,
        },
      }));

      if (passed) soundManager.play('taskCompleted');
      else soundManager.play('error');
    } catch (err: any) {
      setResults(prev => ({
        ...prev,
        [activeTC.id]: {
          passed: false,
          actualOutput: '',
          stderr: err.message || 'Execution failed',
          executionTimeMs: 0,
        },
      }));
      soundManager.play('error');
    } finally {
      setIsRunning(false);
    }
  };

  const currentResult = activeTC ? results[activeTC.id] : null;

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Test Case Header Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-border-default">
        {testCases.map((tc) => {
          const res = results[tc.id];
          return (
            <button
              key={tc.id}
              onClick={() => {
                setActiveTab(tc.id);
                soundManager.play('click');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-2xs font-mono font-medium transition-all shrink-0 ${
                activeTab === tc.id
                  ? 'bg-surface-4 text-text-primary border border-border-strong shadow-sm'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-2'
              }`}
            >
              {res && (
                res.passed ? (
                  <CheckCircle2 size={11} className="text-accent-green" />
                ) : (
                  <XCircle size={11} className="text-accent-red" />
                )
              )}
              <span>{tc.name}</span>
              <span className={`text-3xs px-1 rounded ${categoryPillStyles[tc.category]}`}>
                {tc.category}
              </span>
              {testCases.length > 1 && (
                <span
                  onClick={(e) => handleDeleteTestCase(tc.id, e)}
                  className="ml-1 text-text-quaternary hover:text-accent-red p-0.5"
                  title="Delete test case"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={handleAddTestCase}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-3 text-text-secondary hover:text-text-primary text-2xs transition-colors shrink-0"
          title="Add another test case"
        >
          <Plus size={11} />
          <span>New</span>
        </button>
      </div>

      {activeTC && (
        <div className="space-y-3">
          {/* Category Pill Selector */}
          <div className="space-y-1">
            <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
              Test Category:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => updateActiveTC({ category: cat })}
                  className={`px-2.5 py-1 rounded-full text-2xs font-mono font-medium border transition-all ${
                    activeTC.category === cat
                      ? `${categoryPillStyles[cat]} ring-1 ring-white/20 font-bold scale-[1.02]`
                      : 'border-border-default bg-surface-2 text-text-tertiary hover:border-border-strong'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* OM Explains: What does this test actually check? */}
          <div className="bg-surface-2 border border-border-default rounded-[10px] p-3 space-y-1 relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-accent-copper font-medium text-2xs">
              <Brain size={13} />
              <span>OM Explains: What does this test actually check?</span>
            </div>
            <p className="text-2xs text-text-secondary leading-relaxed pl-5">
              “{mentorSalutation}, {categoryExplanations[activeTC.category]}”
            </p>
          </div>

          {/* Input & Expected Output Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider">
                Custom Input (stdin):
              </label>
              <textarea
                value={activeTC.input}
                onChange={e => updateActiveTC({ input: e.target.value })}
                placeholder="5&#10;2 4 1 7 3&#10;12"
                rows={4}
                className="w-full bg-surface-2 border border-border-default rounded-[8px] p-2.5 font-mono text-2xs text-text-primary outline-none focus:border-border-strong resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider">
                Expected Output:
              </label>
              <textarea
                value={activeTC.expectedOutput}
                onChange={e => updateActiveTC({ expectedOutput: e.target.value })}
                placeholder="12"
                rows={4}
                className="w-full bg-surface-2 border border-border-default rounded-[8px] p-2.5 font-mono text-2xs text-text-primary outline-none focus:border-border-strong resize-none"
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-1">
            <label className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider">
              Description:
            </label>
            <input
              type="text"
              value={activeTC.description}
              onChange={e => updateActiveTC({ description: e.target.value })}
              placeholder="e.g. Checks boundary condition when target is zero"
              className="w-full bg-surface-2 border border-border-default rounded-[8px] px-3 py-1.5 text-2xs text-text-primary outline-none focus:border-border-strong"
            />
          </div>

          {/* Action Button & Test Result */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleRunTestCase}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent-copper text-black font-semibold text-xs hover:bg-accent-copper/90 transition-all shadow-sm disabled:opacity-50"
            >
              {isRunning ? (
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={13} />
              )}
              <span>Run {activeTC.name}</span>
            </button>

            {currentResult && (
              <div className="flex items-center gap-2 text-2xs font-mono">
                {currentResult.passed ? (
                  <span className="flex items-center gap-1 text-accent-green font-semibold">
                    <CheckCircle2 size={13} /> Passed ({currentResult.executionTimeMs}ms)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-accent-red font-semibold">
                    <XCircle size={13} /> Output Mismatch / Error
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Output Display */}
          {currentResult && (
            <div className={`p-3 rounded-[8px] border font-mono text-2xs space-y-1 ${
              currentResult.passed ? 'bg-accent-green/5 border-accent-green/20' : 'bg-accent-red/5 border-accent-red/20'
            }`}>
              <div>
                <span className="text-text-tertiary">Got Output: </span>
                <span className={currentResult.passed ? 'text-text-primary' : 'text-accent-red'}>
                  {currentResult.actualOutput || '(No stdout)'}
                </span>
              </div>
              {activeTC.expectedOutput && (
                <div>
                  <span className="text-text-tertiary">Expected Output: </span>
                  <span className="text-accent-green">{activeTC.expectedOutput}</span>
                </div>
              )}
              {currentResult.stderr && (
                <div className="text-accent-red pt-1 whitespace-pre-wrap border-t border-accent-red/20 mt-1">
                  {currentResult.stderr}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
