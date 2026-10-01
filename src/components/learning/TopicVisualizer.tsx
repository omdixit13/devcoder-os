import React, { useState } from 'react';
import { Play, RotateCcw, ShieldCheck, AlertTriangle, Layers, Database, Code2 } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface TopicVisualizerProps {
  skillId: string;
  topicName: string;
}

export default function TopicVisualizer({ skillId, topicName }: TopicVisualizerProps) {
  // 1. Binary Search State
  const [bsStep, setBsStep] = useState(0);
  const bsArray = [2, 4, 7, 9, 13, 18, 25, 33];
  const bsSteps = [
    { low: 0, high: 7, mid: 3, found: false, desc: 'Initial range: low=0 (2), high=7 (33). Mid index = 3 (val 9). Since 13 > 9, search right half.' },
    { low: 4, high: 7, mid: 5, found: false, desc: 'Right half: low=4 (13), high=7 (33). Mid index = 5 (val 18). Since 13 < 18, search left half.' },
    { low: 4, high: 4, mid: 4, found: true, desc: 'Target matched! low=4, high=4, mid=4 (val 13 == target 13). Found in O(log N) steps!' }
  ];

  // 2. Two Pointers State
  const [tpStep, setTpStep] = useState(0);
  const tpArray = [1, 2, 4, 6, 8, 11]; // Target: 10
  const tpSteps = [
    { left: 0, right: 5, sum: 12, desc: 'L=0 (1) + R=5 (11) = 12. Sum 12 > target 10. Decrement Right pointer (R--).' },
    { left: 0, right: 4, sum: 9, desc: 'L=0 (1) + R=4 (8) = 9. Sum 9 < target 10. Increment Left pointer (L++).' },
    { left: 1, right: 4, sum: 10, found: true, desc: 'L=1 (2) + R=4 (8) = 10 == target 10! Target pair found in O(N) single pass!' }
  ];

  // 3. Sliding Window State
  const [swStep, setSwStep] = useState(0);
  const swArray = [2, 1, 5, 1, 3, 2]; // K = 3
  const swSteps = [
    { start: 0, end: 2, sum: 8, isMax: false, desc: 'Initial window [2, 1, 5] (indices 0..2). Current Window Sum = 8.' },
    { start: 1, end: 3, sum: 7, isMax: false, desc: 'Slide window right: subtract 2, add 1 -> [1, 5, 1]. Current Window Sum = 7.' },
    { start: 2, end: 4, sum: 9, isMax: true, desc: 'Slide right: subtract 1, add 3 -> [5, 1, 3]. Current Window Sum = 9 (Max so far!).' },
    { start: 3, end: 5, sum: 6, isMax: false, desc: 'Slide right: subtract 5, add 2 -> [1, 3, 2]. Current Window Sum = 6. Max result = 9.' }
  ];

  // 4. Stacks & Queues State
  const [stackItems, setStackItems] = useState<number[]>([15, 23, 42]);

  // 5. Cybersecurity SQLi State
  const [sqliInput, setSqliInput] = useState("' OR '1'='1");
  const [usePrepared, setUsePrepared] = useState(false);

  // 6. Flexbox Layout State
  const [flexJustify, setFlexJustify] = useState<'flex-start' | 'center' | 'space-between'>('center');
  const [flexDir, setFlexDir] = useState<'row' | 'column'>('row');

  // RENDER BASED ON SKILL
  if (skillId === 'binary-search') {
    const cur = bsSteps[bsStep] || bsSteps[0];
    return (
      <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xs font-semibold text-accent-copper uppercase tracking-wider">
              Interactive Algorithm Visualizer
            </div>
            <h3 className="text-sm font-semibold text-text-primary mt-0.5">
              Binary Search Pointer Stepper (Target: 13)
            </h3>
          </div>
          <button
            onClick={() => {
              soundManager.play('buttonClick');
              setBsStep((bsStep + 1) % bsSteps.length);
            }}
            className="px-3.5 py-1.5 rounded-full bg-paper-white hover:bg-bone text-obsidian text-2xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm"
          >
            <Play size={11} />
            <span>{bsStep === bsSteps.length - 1 ? 'Reset' : 'Next Step'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {bsArray.map((val, idx) => {
            const isMid = idx === cur.mid;
            const isLow = idx === cur.low;
            const isHigh = idx === cur.high;
            const inRange = idx >= cur.low && idx <= cur.high;
            const isFound = isMid && cur.found;

            return (
              <div key={idx} className="flex flex-col items-center gap-1 min-w-[48px]">
                <span className="text-3xs text-text-tertiary font-mono">[{idx}]</span>
                <div
                  className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center font-mono text-xs font-semibold transition-all ${
                    isFound
                      ? 'bg-accent-green/20 border-accent-green text-accent-green scale-105 shadow-sm'
                      : isMid
                      ? 'bg-accent-copper/20 border-accent-copper text-accent-copper'
                      : inRange
                      ? 'bg-surface-3 border-border-strong text-text-primary'
                      : 'bg-surface-1 border-border-subtle text-text-tertiary opacity-40'
                  }`}
                >
                  <span>{val}</span>
                </div>
                <div className="h-4 flex items-center gap-0.5 text-3xs font-mono font-bold">
                  {isLow && <span className="text-accent-blue">L</span>}
                  {isMid && <span className="text-accent-copper">M</span>}
                  {isHigh && <span className="text-accent-yellow">H</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-surface-1 rounded-lg border border-border-subtle text-2xs text-text-secondary leading-relaxed font-mono">
          <span className="text-text-tertiary">Step {bsStep + 1}: </span>
          {cur.desc}
        </div>
      </div>
    );
  }

  if (skillId === 'two-pointers') {
    const cur = tpSteps[tpStep] || tpSteps[0];
    return (
      <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xs font-semibold text-accent-copper uppercase tracking-wider">
              Interactive Two Pointers Visualizer
            </div>
            <h3 className="text-sm font-semibold text-text-primary mt-0.5">
              Opposite-Direction Pair Sum (Target: 10)
            </h3>
          </div>
          <button
            onClick={() => {
              soundManager.play('buttonClick');
              setTpStep((tpStep + 1) % tpSteps.length);
            }}
            className="px-3.5 py-1.5 rounded-full bg-paper-white hover:bg-bone text-obsidian text-2xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm"
          >
            <Play size={11} />
            <span>{tpStep === tpSteps.length - 1 ? 'Reset' : 'Next Step'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {tpArray.map((val, idx) => {
            const isL = idx === cur.left;
            const isR = idx === cur.right;
            const isPair = (isL || isR) && cur.found;

            return (
              <div key={idx} className="flex flex-col items-center gap-1 min-w-[48px]">
                <span className="text-3xs text-text-tertiary font-mono">[{idx}]</span>
                <div
                  className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center font-mono text-xs font-semibold transition-all ${
                    isPair
                      ? 'bg-accent-green/20 border-accent-green text-accent-green scale-105'
                      : isL
                      ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                      : isR
                      ? 'bg-accent-yellow/20 border-accent-yellow text-accent-yellow'
                      : 'bg-surface-1 border-border-subtle text-text-tertiary'
                  }`}
                >
                  <span>{val}</span>
                </div>
                <div className="h-4 flex items-center gap-1 text-3xs font-mono font-bold">
                  {isL && <span className="text-accent-blue">L</span>}
                  {isR && <span className="text-accent-yellow">R</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-surface-1 rounded-lg border border-border-subtle text-2xs text-text-secondary leading-relaxed font-mono">
          <span className="text-text-tertiary">Step {tpStep + 1}: </span>
          {cur.desc}
        </div>
      </div>
    );
  }

  if (skillId === 'sliding-window') {
    const cur = swSteps[swStep] || swSteps[0];
    return (
      <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xs font-semibold text-accent-copper uppercase tracking-wider">
              Interactive Sliding Window
            </div>
            <h3 className="text-sm font-semibold text-text-primary mt-0.5">
              Maximum Subarray Sum of Size K = 3
            </h3>
          </div>
          <button
            onClick={() => {
              soundManager.play('buttonClick');
              setSwStep((swStep + 1) % swSteps.length);
            }}
            className="px-3.5 py-1.5 rounded-full bg-paper-white hover:bg-bone text-obsidian text-2xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm"
          >
            <Play size={11} />
            <span>{swStep === swSteps.length - 1 ? 'Reset' : 'Next Window'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {swArray.map((val, idx) => {
            const inWindow = idx >= cur.start && idx <= cur.end;

            return (
              <div key={idx} className="flex flex-col items-center gap-1 min-w-[48px]">
                <span className="text-3xs text-text-tertiary font-mono">[{idx}]</span>
                <div
                  className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center font-mono text-xs font-semibold transition-all ${
                    inWindow
                      ? cur.isMax
                        ? 'bg-accent-green/20 border-accent-green text-accent-green scale-105'
                        : 'bg-accent-copper/20 border-accent-copper text-accent-copper'
                      : 'bg-surface-1 border-border-subtle text-text-tertiary opacity-40'
                  }`}
                >
                  <span>{val}</span>
                </div>
                <div className="h-4 text-3xs font-mono font-bold text-accent-copper">
                  {inWindow ? '▲' : ''}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-surface-1 rounded-lg border border-border-subtle text-2xs text-text-secondary leading-relaxed font-mono flex items-center justify-between">
          <div>
            <span className="text-text-tertiary">Step {swStep + 1}: </span>
            {cur.desc}
          </div>
          <span className="px-2 py-0.5 rounded-full bg-surface-3 text-accent-copper font-mono text-2xs">
            Window Sum: {cur.sum}
          </span>
        </div>
      </div>
    );
  }

  if (skillId === 'stacks-queues') {
    return (
      <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xs font-semibold text-accent-copper uppercase tracking-wider">
              Interactive LIFO Stack Visualizer
            </div>
            <h3 className="text-sm font-semibold text-text-primary mt-0.5">
              Stack Memory Operations (Last In, First Out)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.play('buttonClick');
                setStackItems([Math.floor(Math.random() * 80) + 10, ...stackItems]);
              }}
              className="px-3 py-1.5 rounded-full bg-paper-white text-obsidian text-2xs font-semibold transition-all active:scale-[0.98]"
            >
              Push Value
            </button>
            <button
              onClick={() => {
                if (stackItems.length > 0) {
                  soundManager.play('buttonClick');
                  setStackItems(stackItems.slice(1));
                }
              }}
              disabled={stackItems.length === 0}
              className="px-3 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-secondary hover:text-text-primary text-2xs font-medium border border-border-default transition-all"
            >
              Pop Top
            </button>
          </div>
        </div>

        <div className="flex items-end gap-3 p-4 bg-surface-1 rounded-lg border border-border-subtle min-h-[90px]">
          <div className="text-2xs font-mono text-text-tertiary mr-2">TOP ➔</div>
          {stackItems.map((val, idx) => (
            <div
              key={idx}
              className="w-12 h-12 rounded-lg bg-surface-3 border border-border-strong flex items-center justify-center font-mono text-xs font-semibold text-text-primary animate-scale-in"
            >
              {val}
            </div>
          ))}
          {stackItems.length === 0 && (
            <span className="text-2xs text-text-tertiary font-mono">Stack is currently empty.</span>
          )}
        </div>
      </div>
    );
  }

  if (skillId === 'web-sec' || skillId === 'cyber-fundamentals' || skillId === 'networking-sec') {
    const isVulnerable = !usePrepared && sqliInput.includes("'");
    return (
      <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xs font-semibold text-accent-copper uppercase tracking-wider">
              Interactive Security Sandbox
            </div>
            <h3 className="text-sm font-semibold text-text-primary mt-0.5">
              SQL Injection vs. Parameterized Defense Simulator
            </h3>
          </div>
          <button
            onClick={() => {
              soundManager.play('buttonClick');
              setUsePrepared(!usePrepared);
            }}
            className={`px-3 py-1.5 rounded-full text-2xs font-semibold transition-all border ${
              usePrepared
                ? 'bg-accent-green/20 text-accent-green border-accent-green/40'
                : 'bg-accent-red/20 text-accent-red border-accent-red/40'
            }`}
          >
            {usePrepared ? '✓ Prepared Statement ON' : '⚠ Prepared Statement OFF'}
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-2xs text-text-secondary">Simulated User Input Field:</label>
          <input
            type="text"
            value={sqliInput}
            onChange={(e) => setSqliInput(e.target.value)}
            className="w-full bg-surface-1 border border-border-default rounded-lg px-3 py-1.5 font-mono text-xs text-text-primary focus:outline-none focus:border-border-strong"
          />
        </div>

        <div className="p-3 bg-surface-1 rounded-lg border border-border-subtle font-mono text-2xs space-y-1">
          <span className="text-text-tertiary block">Generated Query:</span>
          <code className="text-text-primary block">
            {usePrepared
              ? `SELECT * FROM users WHERE username = ?;  // Bound Param: "${sqliInput}"`
              : `SELECT * FROM users WHERE username = '${sqliInput}';`}
          </code>
        </div>

        <div className={`p-3 rounded-lg border text-2xs font-medium flex items-center gap-2 ${
          isVulnerable
            ? 'bg-accent-red/10 border-accent-red/30 text-accent-red'
            : 'bg-accent-green/10 border-accent-green/30 text-accent-green'
        }`}>
          {isVulnerable ? (
            <>
              <AlertTriangle size={14} />
              <span>Vulnerable! The input modifies query logic. Unauthorized authentication bypass possible!</span>
            </>
          ) : (
            <>
              <ShieldCheck size={14} />
              <span>Secure! Parameterized binding treats the input strictly as literal string data.</span>
            </>
          )}
        </div>
      </div>
    );
  }

  if (skillId === 'html-css' || skillId === 'react' || skillId === 'javascript') {
    return (
      <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xs font-semibold text-accent-copper uppercase tracking-wider">
              Interactive Layout Sandbox
            </div>
            <h3 className="text-sm font-semibold text-text-primary mt-0.5">
              CSS Flexbox Axis & Alignment Inspector
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.play('buttonClick');
                setFlexJustify(flexJustify === 'center' ? 'space-between' : flexJustify === 'space-between' ? 'flex-start' : 'center');
              }}
              className="px-3 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-2xs text-text-secondary border border-border-default"
            >
              Justify: {flexJustify}
            </button>
            <button
              onClick={() => {
                soundManager.play('buttonClick');
                setFlexDir(flexDir === 'row' ? 'column' : 'row');
              }}
              className="px-3 py-1.5 rounded-full bg-paper-white text-obsidian text-2xs font-semibold"
            >
              Dir: {flexDir}
            </button>
          </div>
        </div>

        <div
          className="p-4 bg-surface-1 rounded-lg border border-border-subtle min-h-[110px] flex gap-3 transition-all duration-300"
          style={{ justifyContent: flexJustify, flexDirection: flexDir }}
        >
          <div className="w-14 h-12 rounded-lg bg-surface-3 border border-border-strong flex items-center justify-center text-xs font-mono text-accent-copper font-bold">
            1
          </div>
          <div className="w-14 h-12 rounded-lg bg-surface-3 border border-border-strong flex items-center justify-center text-xs font-mono text-accent-blue font-bold">
            2
          </div>
          <div className="w-14 h-12 rounded-lg bg-surface-3 border border-border-strong flex items-center justify-center text-xs font-mono text-accent-green font-bold">
            3
          </div>
        </div>
      </div>
    );
  }

  // Default interactive code/concept runner
  return (
    <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xs font-semibold text-accent-copper uppercase tracking-wider">
            Interactive Concept Runner
          </div>
          <h3 className="text-sm font-semibold text-text-primary mt-0.5">
            {topicName} Execution Pattern
          </h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-surface-3 text-2xs font-mono text-text-tertiary">
          O(1) Memory Layout
        </span>
      </div>

      <div className="p-4 bg-surface-1 rounded-lg border border-border-subtle font-mono text-2xs text-text-secondary leading-relaxed">
        <div className="text-accent-copper">// Core mental model for {topicName}</div>
        <div>const state = initializeState();</div>
        <div>while (conditionIsMet(state)) &#123;</div>
        <div className="pl-4">state = applyOptimalTransition(state);</div>
        <div>&#125;</div>
        <div className="text-accent-green mt-1">// Verified and production ready</div>
      </div>
    </div>
  );
}
