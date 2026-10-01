import React, { useState } from 'react';
import { 
  Compass, ArrowRight, ArrowLeft, RotateCcw, Check, Sparkles, 
  Shield, Brain, Code2, Server, Cloud, Database, Cpu, Smartphone, 
  BarChart3, Layers, Play, CheckCircle2, AlertCircle, Heart, ThumbsUp, Meh, Frown
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  compassQuestions, 
  careerTracksInfo, 
  computeInterestSignals 
} from '../data/careerCompassData';
import type { CareerTrackId, InterestSignal } from '../types';
import { soundManager } from '../utils/soundManager';
import { triggerConfetti } from '../utils/confetti';

const trackIcons: Record<CareerTrackId, React.ReactNode> = {
  ai_ml: <Brain size={18} className="text-accent-purple" />,
  data_science: <BarChart3 size={18} className="text-accent-blue" />,
  full_stack: <Code2 size={18} className="text-paper-white" />,
  cybersecurity: <Shield size={18} className="text-accent-red" />,
  cloud_devops: <Cloud size={18} className="text-accent-cyan" />,
  data_engineering: <Database size={18} className="text-accent-yellow" />,
  backend_systems: <Server size={18} className="text-accent-copper" />,
  product_tech: <Layers size={18} className="text-accent-gilded" />,
  applied_research: <Cpu size={18} className="text-accent-blue" />,
  mobile_dev: <Smartphone size={18} className="text-accent-green" />,
};

export default function CareerCompassPage() {
  const { setCurrentPage, setSelectedCategory } = useAppStore();
  
  // Navigation inside Compass: 'welcome' | 'quiz' | 'results'
  const [stage, setStage] = useState<'welcome' | 'quiz' | 'results'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Active experiment tab inside results
  const [activeExperiment, setActiveExperiment] = useState<CareerTrackId>('ai_ml');
  
  // ML Experiment State
  const [mlParams, setMlParams] = useState({ split: 80, epochs: 15, regularize: true });
  const [mlResults, setMlResults] = useState<{ accuracy: number; loss: number } | null>(null);
  
  // Security Experiment State
  const [secInput, setSecInput] = useState("admin' OR '1'='1");
  const [secSanitizeActive, setSecSanitizeActive] = useState(false);
  
  // Full Stack Experiment State
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiEndpoint, setApiEndpoint] = useState('/api/v1/opportunities');
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Reflections state
  const [reflections, setReflections] = useState<Record<string, { rating: string; enjoyed: string; frustrated: string }>>({});

  const totalQuestions = compassQuestions.length;
  const currentQuestion = compassQuestions[currentQuestionIndex];

  const handleStart = () => {
    soundManager.play('click');
    setStage('quiz');
    setCurrentQuestionIndex(0);
  };

  const handleSelectOption = (optionId: string) => {
    soundManager.play('buttonClick');
    const updated = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(updated);
    
    // Auto-advance if not last question
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 200);
    }
  };

  const handleBack = () => {
    soundManager.play('click');
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStage('welcome');
    }
  };

  const handleFinish = () => {
    soundManager.play('milestone');
    triggerConfetti();
    setStage('results');
  };

  const interestSignals = computeInterestSignals(answers);
  const topSignals = interestSignals.slice(0, 3);

  // Handle roadmap transition
  const handleGenerateRoadmap = (trackId: CareerTrackId) => {
    soundManager.play('click');
    if (trackId === 'ai_ml') setSelectedCategory('AI/ML');
    else if (trackId === 'cybersecurity') setSelectedCategory('Cybersecurity');
    else if (trackId === 'full_stack' || trackId === 'mobile_dev') setSelectedCategory('Web Development');
    else setSelectedCategory('DSA');
    setCurrentPage('roadmap');
  };

  // Run ML Experiment
  const handleRunMl = () => {
    soundManager.play('buttonClick');
    const baseAcc = 78 + (mlParams.split * 0.1) + (mlParams.epochs * 0.5) - (mlParams.regularize ? 2 : 5);
    const clampedAcc = Math.min(96.4, Math.max(68.2, Number(baseAcc.toFixed(1))));
    const loss = Number((1.2 - (clampedAcc * 0.01)).toFixed(3));
    setMlResults({ accuracy: clampedAcc, loss });
  };

  // Run API Experiment
  const handleRunApi = () => {
    soundManager.play('buttonClick');
    if (apiEndpoint === '/api/v1/opportunities') {
      setApiResponse({
        status: 200,
        statusText: 'OK',
        latencyMs: 38,
        cache: 'HIT (Redis 0.8ms)',
        body: [
          { id: 'opp-1', name: 'ML Challenge 2026', type: 'Hackathon', deadline: '2026-10-05' },
          { id: 'opp-2', name: 'PicoCTF 2026', type: 'CTF', deadline: '2026-10-15' }
        ]
      });
    } else {
      setApiResponse({
        status: 201,
        statusText: 'CREATED',
        latencyMs: 64,
        cache: 'BYPASS',
        body: { success: true, timestamp: new Date().toISOString(), recordId: 'sol_9841' }
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full min-w-0">
        
        {/* ========================================================
            STAGE 1: WELCOME SCREEN
           ======================================================== */}
        {stage === 'welcome' && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in min-w-0">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-2xs font-semibold text-accent-copper uppercase tracking-wider">
                  Self-Discovery Engine
                </span>
                <span className="text-text-tertiary">·</span>
                <span className="text-2xs text-text-tertiary">14 Questions · 5 Minutes</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif text-text-primary tracking-tight font-normal mb-3 break-words">
                CAREER COMPASS
              </h1>

              <p className="text-base sm:text-lg text-text-secondary max-w-2xl font-light leading-relaxed">
                “Where does your curiosity naturally pull you?”
              </p>

              <div className="mt-4 p-3.5 bg-surface-2 border border-border-default rounded-[10px] flex items-start gap-3 max-w-2xl">
                <AlertCircle size={16} className="text-accent-copper shrink-0 mt-0.5" />
                <p className="text-xs text-text-tertiary leading-relaxed">
                  <strong className="text-text-secondary font-medium">Important note:</strong> This is a structured self-assessment, not an arbitrary personality label or career guarantee. It highlights where your technical instincts, mathematical comfort, and problem-solving styles align.
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div>
              <button
                onClick={handleStart}
                className="bg-paper-white hover:bg-white/90 text-obsidian px-7 py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 group w-full sm:w-auto"
              >
                <span>START ASSESSMENT</span>
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Explored Tracks Preview Grid */}
            <div>
              <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
                10 Technology Tracks Evaluated
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(careerTracksInfo).map(([id, info]) => (
                  <div
                    key={id}
                    className="p-3.5 bg-surface-2 border border-border-default rounded-[10px] flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-3 border border-border-subtle flex items-center justify-center shrink-0">
                      {trackIcons[id as CareerTrackId]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-text-primary truncate">{info.title}</div>
                      <div className="text-2xs text-text-tertiary mt-0.5 line-clamp-2 leading-relaxed">{info.tagline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STAGE 2: QUESTION BY QUESTION ASSESSMENT
           ======================================================== */}
        {stage === 'quiz' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Top Navigation & Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                <span>QUESTION {currentQuestionIndex + 1} OF {totalQuestions}</span>
                <span className="text-accent-copper font-mono">
                  {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-paper-white transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-surface-2 border border-border-default rounded-[10px] p-6 space-y-6">
              <div>
                <h2 className="text-lg font-medium text-text-primary leading-snug">
                  {currentQuestion.questionText}
                </h2>
                
                {/* Bhai Hint */}
                <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-surface-3/70 border border-border-subtle">
                  <Sparkles size={14} className="text-accent-copper shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary italic leading-relaxed">
                    {currentQuestion.bhaiHint}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map(option => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full text-left p-4 rounded-[10px] border transition-all text-xs flex items-start gap-3.5 group ${
                        isSelected
                          ? 'bg-surface-3 border-paper-white text-text-primary'
                          : 'bg-surface-1 border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-paper-white bg-paper-white' : 'border-border-strong group-hover:border-text-secondary'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-obsidian" />}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${isSelected ? 'text-text-primary' : 'text-bone'}`}>
                          {option.text}
                        </div>
                        <div className="text-2xs text-text-tertiary mt-0.5">
                          {option.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 rounded-full border border-border-default hover:bg-surface-3 text-text-secondary hover:text-text-primary text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft size={13} />
                  <span>{currentQuestionIndex === 0 ? 'Exit' : 'Back'}</span>
                </button>

                {currentQuestionIndex === totalQuestions - 1 ? (
                  <button
                    onClick={handleFinish}
                    disabled={!answers[currentQuestion.id]}
                    className="bg-paper-white hover:bg-white/90 disabled:opacity-50 text-obsidian px-6 py-2 rounded-full text-xs font-semibold transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5"
                  >
                    <span>View Interest Signals</span>
                    <Sparkles size={13} className="text-accent-copper" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (currentQuestionIndex < totalQuestions - 1) {
                        setCurrentQuestionIndex(prev => prev + 1);
                      }
                    }}
                    disabled={!answers[currentQuestion.id]}
                    className="bg-paper-white hover:bg-white/90 disabled:opacity-50 text-obsidian px-5 py-2 rounded-full text-xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STAGE 3: RESULTS & INTEREST SIGNALS + EXPERIMENTS
           ======================================================== */}
        {stage === 'results' && (
          <div className="space-y-8 animate-fade-in">
            {/* Results Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xs font-semibold text-accent-copper uppercase tracking-wider">
                  Assessment Complete
                </span>
                <span className="text-text-tertiary">·</span>
                <button
                  onClick={() => setStage('welcome')}
                  className="text-2xs text-text-tertiary hover:text-text-primary flex items-center gap-1"
                >
                  <RotateCcw size={10} /> Retake Assessment
                </button>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif text-text-primary font-normal tracking-tight mb-2">
                Your Technical Interest Signals
              </h1>

              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                Rather than labeling you with a single restrictive career title, your answers indicate strong curiosity in multiple complementary engineering areas.
              </p>
            </div>

            {/* Top 3 Signals Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topSignals.map((signal, idx) => (
                <div
                  key={signal.trackId}
                  className="bg-surface-2 border border-border-default rounded-[10px] p-5 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full bg-surface-4 border border-border-subtle flex items-center justify-center">
                        {trackIcons[signal.trackId]}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-medium border ${
                        signal.strength === 'strong'
                          ? 'bg-paper-white/10 text-paper-white border-paper-white/30'
                          : 'bg-surface-3 text-text-secondary border-border-subtle'
                      }`}>
                        {signal.strength === 'strong' ? 'Strong Interest Signal' : 'Moderate Interest Signal'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-text-primary tracking-tight">{signal.title}</h3>
                      <p className="text-2xs text-text-tertiary mt-1 leading-relaxed">
                        {signal.whyThisAppeared[0]}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border-subtle">
                      <div className="text-2xs font-semibold text-accent-copper uppercase tracking-wider mb-1">
                        Observed Preference
                      </div>
                      <div className="text-2xs text-text-secondary leading-relaxed">
                        {signal.observedPreferences[0]}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                    <button
                      onClick={() => setActiveExperiment(signal.trackId)}
                      className="text-2xs font-medium text-text-secondary hover:text-paper-white transition-colors"
                    >
                      Try Experiment ↓
                    </button>
                    <button
                      onClick={() => handleGenerateRoadmap(signal.trackId)}
                      className="text-2xs font-semibold text-accent-copper hover:underline flex items-center gap-1"
                    >
                      Roadmap →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ========================================================
                TRY BEFORE YOU COMMIT: INTERACTIVE EXPERIMENTS (Section 25)
               ======================================================== */}
            <div className="bg-surface-2 border border-border-default rounded-[10px] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
                <div>
                  <div className="text-2xs font-semibold uppercase tracking-wider text-accent-copper">
                    Try Before You Commit
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mt-0.5">
                    Hands-On Technical Micro-Experiments
                  </h3>
                  <p className="text-xs text-text-tertiary">
                    Spend 2 minutes inside the code and tools before choosing where to invest weeks of study.
                  </p>
                </div>

                {/* Tabs to pick experiment */}
                <div className="flex items-center gap-1.5 bg-surface-1 p-1 rounded-full border border-border-subtle shrink-0">
                  <button
                    onClick={() => { soundManager.play('buttonClick'); setActiveExperiment('ai_ml'); }}
                    className={`px-3 py-1 rounded-full text-2xs font-medium transition-colors ${
                      activeExperiment === 'ai_ml' ? 'bg-surface-3 text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    AI / ML
                  </button>
                  <button
                    onClick={() => { soundManager.play('buttonClick'); setActiveExperiment('cybersecurity'); }}
                    className={`px-3 py-1 rounded-full text-2xs font-medium transition-colors ${
                      activeExperiment === 'cybersecurity' ? 'bg-surface-3 text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    Cybersecurity
                  </button>
                  <button
                    onClick={() => { soundManager.play('buttonClick'); setActiveExperiment('full_stack'); }}
                    className={`px-3 py-1 rounded-full text-2xs font-medium transition-colors ${
                      activeExperiment === 'full_stack' ? 'bg-surface-3 text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    Full Stack API
                  </button>
                </div>
              </div>

              {/* EXPERIMENT 1: AI / ML Parameter & Evaluation Simulator */}
              {activeExperiment === 'ai_ml' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">
                        Experiment: Predictive Model Tuning & Validation Metric
                      </h4>
                      <p className="text-2xs text-text-tertiary mt-0.5">
                        Adjust training dataset split and epochs to observe accuracy/loss divergence.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface-3 text-2xs text-text-tertiary font-mono">
                      scikit-learn / LightGBM
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-surface-1 rounded-lg border border-border-subtle">
                    <div>
                      <label className="block text-2xs text-text-secondary mb-1">
                        Train / Val Split: {mlParams.split}% / {100 - mlParams.split}%
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="90"
                        value={mlParams.split}
                        onChange={(e) => setMlParams({ ...mlParams, split: Number(e.target.value) })}
                        className="w-full accent-accent-purple"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs text-text-secondary mb-1">
                        Training Epochs: {mlParams.epochs}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={mlParams.epochs}
                        onChange={(e) => setMlParams({ ...mlParams, epochs: Number(e.target.value) })}
                        className="w-full accent-accent-purple"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleRunMl}
                        className="w-full py-1.5 px-3 rounded-full bg-paper-white hover:bg-bone text-obsidian text-xs font-semibold transition-all active:scale-[0.98]"
                      >
                        Train Baseline Model
                      </button>
                    </div>
                  </div>

                  {mlResults && (
                    <div className="p-3.5 bg-surface-3 rounded-lg border border-border-subtle flex items-center justify-around text-center animate-fade-in">
                      <div>
                        <div className="text-2xs text-text-tertiary">Validation Accuracy</div>
                        <div className="text-base font-semibold text-accent-green font-mono">{mlResults.accuracy}%</div>
                      </div>
                      <div>
                        <div className="text-2xs text-text-tertiary">Log Loss</div>
                        <div className="text-base font-semibold text-accent-blue font-mono">{mlResults.loss}</div>
                      </div>
                      <div>
                        <div className="text-2xs text-text-tertiary">Outcome</div>
                        <div className="text-xs font-medium text-text-primary">
                          {mlResults.accuracy > 90 ? 'High Generalization' : 'Optimal Fit'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EXPERIMENT 2: Cybersecurity Request Sanitizer & SQLi Probe */}
              {activeExperiment === 'cybersecurity' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">
                        Experiment: HTTP Request Header & Payload Inspection
                      </h4>
                      <p className="text-2xs text-text-tertiary mt-0.5">
                        Test input payloads against an active sanitizer filter.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface-3 text-2xs text-accent-red font-mono">
                      OWASP Top 10 Lab
                    </span>
                  </div>

                  <div className="space-y-3 p-4 bg-surface-1 rounded-lg border border-border-subtle">
                    <div>
                      <label className="block text-2xs text-text-secondary mb-1">
                        Injected Payload String:
                      </label>
                      <input
                        type="text"
                        value={secInput}
                        onChange={(e) => setSecInput(e.target.value)}
                        className="w-full bg-surface-2 border border-border-default rounded-lg px-3 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-border-strong"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
                        <input
                          type="checkbox"
                          checked={secSanitizeActive}
                          onChange={(e) => setSecSanitizeActive(e.target.checked)}
                          className="rounded border-border-default accent-paper-white"
                        />
                        <span>Enable WAF / Parameterized Sanitizer</span>
                      </label>
                    </div>

                    <div className="p-3 bg-surface-2 rounded-lg border border-border-subtle font-mono text-2xs space-y-1">
                      <div><span className="text-text-tertiary">Method:</span> POST /login HTTP/1.1</div>
                      <div>
                        <span className="text-text-tertiary">Raw Query:</span> SELECT * FROM users WHERE user = '{secInput}'
                      </div>
                      <div className="pt-1 text-xs">
                        {secSanitizeActive ? (
                          <span className="text-accent-green font-semibold">
                            [PROTECTED] Parameterized Query escaped input safely. Attack neutralized.
                          </span>
                        ) : (
                          <span className="text-accent-red font-semibold">
                            [ALERT] SQL Injection syntax detected! Authentication bypass vulnerability.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EXPERIMENT 3: Full Stack REST API & Latency Inspector */}
              {activeExperiment === 'full_stack' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">
                        Experiment: Client-Server API Request Dispatcher
                      </h4>
                      <p className="text-2xs text-text-tertiary mt-0.5">
                        Dispatch mock API calls and inspect status codes, payload structures, and response latencies.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface-3 text-2xs text-paper-white font-mono">
                      REST / TypeScript
                    </span>
                  </div>

                  <div className="p-4 bg-surface-1 rounded-lg border border-border-subtle space-y-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={apiMethod}
                        onChange={(e) => setApiMethod(e.target.value as any)}
                        className="bg-surface-2 border border-border-default rounded-lg px-2.5 py-1.5 text-xs font-mono text-accent-copper focus:outline-none"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                      <input
                        type="text"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        className="flex-1 bg-surface-2 border border-border-default rounded-lg px-3 py-1.5 text-xs font-mono text-text-primary focus:outline-none"
                      />
                      <button
                        onClick={handleRunApi}
                        className="px-4 py-1.5 rounded-full bg-paper-white hover:bg-bone text-obsidian text-xs font-semibold transition-all active:scale-[0.98]"
                      >
                        Send
                      </button>
                    </div>

                    {apiResponse && (
                      <div className="p-3 bg-surface-2 rounded-lg border border-border-subtle font-mono text-2xs space-y-1.5 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <span className="text-accent-green font-semibold">HTTP {apiResponse.status} {apiResponse.statusText}</span>
                          <span className="text-text-tertiary">·</span>
                          <span className="text-text-secondary">{apiResponse.latencyMs} ms</span>
                          <span className="text-text-tertiary">·</span>
                          <span className="text-accent-blue">{apiResponse.cache}</span>
                        </div>
                        <pre className="text-text-secondary overflow-x-auto p-2 bg-surface-0/60 rounded border border-border-subtle">
                          {JSON.stringify(apiResponse.body, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* POST-EXPERIMENT REFLECTION PROMPT (Section 25) */}
              <div className="pt-4 border-t border-border-subtle space-y-3">
                <div className="text-xs font-medium text-text-primary">
                  How did this micro-experiment feel to you?
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: 'Loved it', icon: <Heart size={13} className="text-accent-red" /> },
                    { label: 'Liked it', icon: <ThumbsUp size={13} className="text-accent-blue" /> },
                    { label: 'Neutral', icon: <Meh size={13} className="text-text-tertiary" /> },
                    { label: "Didn't enjoy it", icon: <Frown size={13} className="text-accent-yellow" /> },
                  ].map(rating => (
                    <button
                      key={rating.label}
                      onClick={() => {
                        soundManager.play('buttonClick');
                        setReflections({
                          ...reflections,
                          [activeExperiment]: { ...reflections[activeExperiment], rating: rating.label, enjoyed: '', frustrated: '' }
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        reflections[activeExperiment]?.rating === rating.label
                          ? 'bg-surface-3 border-paper-white text-text-primary'
                          : 'border-border-default hover:bg-surface-3 text-text-secondary'
                      }`}
                    >
                      {rating.icon}
                      <span>{rating.label}</span>
                    </button>
                  ))}
                </div>

                {reflections[activeExperiment]?.rating && (
                  <p className="text-2xs text-accent-green font-medium animate-fade-in">
                    ✓ Feedback saved: this reflection refines your personalized recommendations.
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Call to Action (Section 26) */}
            <div className="p-6 bg-gradient-to-r from-surface-2 to-surface-3 border border-border-default rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Ready to Turn Insights Into a Learning Plan?
                </h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Generate your personalized skill map based on your strongest interest signals.
                </p>
              </div>
              <button
                onClick={() => handleGenerateRoadmap(topSignals[0].trackId)}
                className="bg-paper-white hover:bg-bone text-obsidian px-6 py-2.5 rounded-full text-xs font-semibold transition-all active:scale-[0.98] shadow-md shrink-0 flex items-center gap-1.5"
              >
                <span>GENERATE PERSONALIZED ROADMAP</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
