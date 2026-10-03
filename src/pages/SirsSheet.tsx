import React, { useState, useMemo } from 'react';
import {
  FileText, ExternalLink, Code2, BookOpen, CheckCircle2, Circle, AlertCircle,
  HelpCircle, Eye, Search, Filter, Sparkles, Layers, ArrowRight, RefreshCw, ChevronDown
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useCodingLabStore } from '../store/useCodingLabStore';
import type { SirsSheetProblem, SirsSheetTopic, SirsSheetStatus } from '../types';
import { patternChallenges, type PatternRecognitionChallenge } from '../data/patternRecognitionData';

const TOPIC_CONFIG: Record<SirsSheetTopic, { label: string; badge: string; border: string }> = {
  two_pointers: {
    label: 'TWO POINTERS',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    border: 'border-emerald-500/20',
  },
  hashmap_prefix: {
    label: 'HASHMAP / PREFIX / SUBARRAY',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    border: 'border-amber-500/20',
  },
  binary_search: {
    label: 'BINARY SEARCH',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    border: 'border-cyan-500/20',
  },
  matrix_2d: {
    label: '2D ARRAY',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    border: 'border-purple-500/20',
  },
};

const STATUS_CONFIG: Record<SirsSheetStatus, { label: string; color: string; bg: string }> = {
  not_started: { label: 'NOT STARTED', color: 'text-text-muted', bg: 'bg-graphite/40' },
  learning: { label: 'LEARNING', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  attempted: { label: 'ATTEMPTED', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  solved: { label: 'SOLVED', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  needs_review: { label: 'NEEDS REVIEW', color: 'text-rose-400', bg: 'bg-rose-400/10' },
};

export default function SirsSheetPage() {
  const { sirsSheetProblems, updateSirsSheetStatus, setCurrentPage, setSelectedConceptId } = useAppStore();
  const { selectProblem } = useCodingLabStore();

  const [activeTab, setActiveTab] = useState<'sheet' | 'pattern_recognition'>('sheet');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pattern recognition challenge state
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return sirsSheetProblems.filter((p) => {
      if (topicFilter !== 'all' && p.topic !== topicFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesPlatform = p.platform.toLowerCase().includes(q);
        const matchesTopic = p.topicLabel.toLowerCase().includes(q);
        if (!matchesTitle && !matchesPlatform && !matchesTopic) return false;
      }
      return true;
    });
  }, [sirsSheetProblems, topicFilter, statusFilter, searchQuery]);

  // Group by topic
  const groupedByTopic = useMemo(() => {
    const map: Record<SirsSheetTopic, SirsSheetProblem[]> = {
      two_pointers: [],
      hashmap_prefix: [],
      binary_search: [],
      matrix_2d: [],
    };
    filteredProblems.forEach((p) => {
      if (map[p.topic]) {
        map[p.topic].push(p);
      }
    });
    return map;
  }, [filteredProblems]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = sirsSheetProblems.length;
    const solved = sirsSheetProblems.filter((p) => p.status === 'solved').length;
    const attempted = sirsSheetProblems.filter((p) => p.status === 'attempted').length;
    const learning = sirsSheetProblems.filter((p) => p.status === 'learning').length;
    const needsReview = sirsSheetProblems.filter((p) => p.status === 'needs_review').length;
    return { total, solved, attempted, learning, needsReview };
  }, [sirsSheetProblems]);

  const handlePracticeInLab = (p: SirsSheetProblem) => {
    const targetId = p.codingLabProblemId || `sir-${String(p.orderNumber).padStart(3, '0')}`;
    selectProblem(targetId);
    setCurrentPage('codinglab');
  };

  const handleLearnConcept = (p: SirsSheetProblem) => {
    const targetId = p.codingLabProblemId || `sir-${String(p.orderNumber).padStart(3, '0')}`;
    selectProblem(targetId);
    if (p.conceptId) {
      setSelectedConceptId(p.conceptId);
    }
    setCurrentPage('learning');
  };

  const currentChallenge = patternChallenges[currentChallengeIndex];
  const techniqueOptions = ['Prefix Technique', 'Two Pointers', 'HashMap', 'Binary Search', '2D Array', 'Not sure'] as const;

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
      {/* Top Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-border/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper/10 border border-copper/30 text-copper text-xs font-mono tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Source of Truth
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-text-primary tracking-tight">
            Sir's Practice Sheet
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Authoritative 29-problem syllabus across Prefix, Two Pointers, HashMap, Binary Search, and 2D Array.
          </p>
        </div>

        {/* View Switcher Tabs & Direct Practice */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              const firstUnsolved = sirsSheetProblems.find(p => p.status !== 'solved') || sirsSheetProblems[0];
              handlePracticeInLab(firstUnsolved);
            }}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-copper text-black hover:bg-copper/90 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Direct Practice</span>
          </button>

          <div className="flex items-center bg-carbon border border-border/60 rounded-full p-1">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'sheet'
                  ? 'bg-copper text-black font-semibold shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All 29 Problems
            </button>
            <button
              onClick={() => setActiveTab('pattern_recognition')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'pattern_recognition'
                  ? 'bg-copper text-black font-semibold shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Pattern Recognition Mode
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="p-3.5 rounded-[10px] bg-carbon border border-border/40">
          <span className="text-xs text-text-tertiary uppercase font-mono tracking-wider block">Total Sheet</span>
          <span className="text-xl font-display font-semibold text-text-primary mt-1 block">{stats.total}</span>
        </div>
        <div className="p-3.5 rounded-[10px] bg-carbon border border-emerald-500/20">
          <span className="text-xs text-emerald-400 uppercase font-mono tracking-wider block">Solved</span>
          <span className="text-xl font-display font-semibold text-emerald-400 mt-1 block">{stats.solved}</span>
        </div>
        <div className="p-3.5 rounded-[10px] bg-carbon border border-cyan-500/20">
          <span className="text-xs text-cyan-400 uppercase font-mono tracking-wider block">Attempted</span>
          <span className="text-xl font-display font-semibold text-cyan-400 mt-1 block">{stats.attempted}</span>
        </div>
        <div className="p-3.5 rounded-[10px] bg-carbon border border-amber-500/20">
          <span className="text-xs text-amber-400 uppercase font-mono tracking-wider block">Learning</span>
          <span className="text-xl font-display font-semibold text-amber-400 mt-1 block">{stats.learning}</span>
        </div>
        <div className="p-3.5 rounded-[10px] bg-carbon border border-rose-500/20 col-span-2 sm:col-span-1">
          <span className="text-xs text-rose-400 uppercase font-mono tracking-wider block">Needs Review</span>
          <span className="text-xl font-display font-semibold text-rose-400 mt-1 block">{stats.needsReview}</span>
        </div>
      </div>

      {activeTab === 'pattern_recognition' ? (
        /* PATTERN RECOGNITION MODE ("WHAT TECHNIQUE DO YOU SEE?") */
        <div className="space-y-6">
          <div className="p-6 rounded-[10px] bg-carbon border border-border/60">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-copper/15 text-copper border border-copper/30">
                  Challenge {currentChallengeIndex + 1} of {patternChallenges.length}
                </span>
                <span className="text-xs text-text-tertiary">| Related: {currentChallenge.relatedSheetProblem}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedGuess(null);
                  setShowAnswer(false);
                  setCurrentChallengeIndex((prev) => (prev + 1) % patternChallenges.length);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-copper hover:underline font-mono"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Next Challenge
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-medium text-text-primary mb-3 leading-relaxed">
              {currentChallenge.scenario}
            </h2>

            <div className="p-3.5 rounded-[10px] bg-graphite/40 border border-border/40 font-mono text-xs text-text-primary mb-5">
              <span className="text-text-tertiary block mb-1 font-sans">Input characteristics:</span>
              {currentChallenge.inputDescription}
            </div>

            <div className="mb-5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary block mb-1.5">
                Clues Observed:
              </span>
              <ul className="space-y-1">
                {currentChallenge.clues.map((c: string, idx: number) => (
                  <li key={idx} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <span className="text-copper font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
              WHAT TECHNIQUE DO YOU SEE FIRST?
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
              {techniqueOptions.map((opt: string) => {
                const isSelected = selectedGuess === opt;
                const isCorrect = opt === currentChallenge.correctTechnique;
                let btnStyle = 'bg-graphite/40 border-border/60 text-text-primary hover:border-copper/60';
                if (showAnswer) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 line-through';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-copper text-black font-semibold border-copper';
                }

                return (
                  <button
                    key={opt}
                    disabled={showAnswer}
                    onClick={() => setSelectedGuess(opt)}
                    className={`px-4 py-2.5 rounded-full text-xs text-left border transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {!showAnswer ? (
              <button
                disabled={!selectedGuess}
                onClick={() => setShowAnswer(true)}
                className="px-6 py-2 rounded-full bg-text-primary text-black font-medium text-xs hover:bg-white/90 disabled:opacity-40 transition-all"
              >
                Check Pattern
              </button>
            ) : (
              <div className="mt-4 p-4 rounded-[10px] bg-carbon border border-copper/30 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-copper" />
                  <span className="text-xs font-mono uppercase tracking-wider text-copper font-semibold">
                    OM Mentorship Breakdown
                  </span>
                </div>
                <p className="text-sm text-text-primary mb-3 leading-relaxed">
                  {currentChallenge.explanation}
                </p>
                <div className="text-xs text-text-tertiary space-y-1 mb-4">
                  <div>
                    <strong className="text-rose-400">Why other approaches fail:</strong> {currentChallenge.whyOthersFail}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedGuess(null);
                    setShowAnswer(false);
                    setCurrentChallengeIndex((prev) => (prev + 1) % patternChallenges.length);
                  }}
                  className="px-5 py-1.5 rounded-full bg-copper text-black font-medium text-xs hover:bg-copper/90 transition-all"
                >
                  Try Next Problem
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ALL 29 PROBLEMS LIST */
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-carbon border border-border/40 p-3 rounded-[10px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search problem, topic or platform..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-graphite/40 border border-border/50 rounded-full text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-copper/60 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                aria-label="Filter by Topic"
                className="px-3 py-1.5 text-xs bg-graphite/40 border border-border/50 rounded-full text-text-secondary focus:outline-none focus:border-copper/60"
              >
                <option value="all">All Topics (4)</option>
                <option value="two_pointers">Two Pointers</option>
                <option value="hashmap_prefix">HashMap / Prefix</option>
                <option value="binary_search">Binary Search</option>
                <option value="matrix_2d">2D Array</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
                className="px-3 py-1.5 text-xs bg-graphite/40 border border-border/50 rounded-full text-text-secondary focus:outline-none focus:border-copper/60"
              >
                <option value="all">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="learning">Learning</option>
                <option value="attempted">Attempted</option>
                <option value="solved">Solved</option>
                <option value="needs_review">Needs Review</option>
              </select>
            </div>
          </div>

          {/* Render Sections */}
          {(Object.keys(groupedByTopic) as SirsSheetTopic[]).map((topicKey) => {
            const problems = groupedByTopic[topicKey];
            if (problems.length === 0) return null;
            const config = TOPIC_CONFIG[topicKey];

            return (
              <div key={topicKey} className="space-y-3">
                <div className="flex items-center gap-2.5 pt-2">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-mono font-semibold border ${config.badge}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-text-tertiary">({problems.length} problems)</span>
                </div>

                <div className="divide-y divide-border/30 bg-carbon border border-border/40 rounded-[10px] overflow-hidden">
                  {problems.map((p) => {
                    const statusInfo = STATUS_CONFIG[p.status];

                    return (
                      <div
                        key={p.id}
                        className="p-3.5 sm:p-4 hover:bg-graphite/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-xs text-text-tertiary w-6 pt-0.5 shrink-0">
                            #{p.orderNumber}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-medium text-text-primary">
                                {p.title}
                              </h4>
                              {p.isDuplicatePreserved && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  Duplicate Preserved
                                </span>
                              )}
                              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-graphite/60 text-text-secondary border border-border/40">
                                {p.platform}
                              </span>
                              <span className="text-[10px] font-mono text-text-tertiary">
                                {p.difficulty}
                              </span>
                            </div>

                            <p className="text-xs text-text-tertiary mt-1">
                              {p.topicLabel} • Attempts: {p.attempts}
                            </p>
                          </div>
                        </div>

                        {/* Actions & Status Pill */}
                        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto pl-9 md:pl-0">
                          {/* Status Dropdown */}
                          <select
                            value={p.status}
                            onChange={(e) => updateSirsSheetStatus(p.id, e.target.value as SirsSheetStatus)}
                            aria-label={`Update status for ${p.title}`}
                            className={`px-3 py-1 rounded-full text-xs font-mono border border-border/40 focus:outline-none ${statusInfo.bg} ${statusInfo.color}`}
                          >
                            <option value="not_started">NOT STARTED</option>
                            <option value="learning">LEARNING</option>
                            <option value="attempted">ATTEMPTED</option>
                            <option value="solved">SOLVED</option>
                            <option value="needs_review">NEEDS REVIEW</option>
                          </select>

                          {/* Action Buttons */}
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border border-border/60 text-text-secondary hover:text-text-primary hover:border-text-primary/60 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open
                          </a>

                          <button
                            onClick={() => handlePracticeInLab(p)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-copper text-black font-semibold hover:bg-copper/90 transition-colors"
                          >
                            <Code2 className="w-3 h-3" />
                            Practice
                          </button>

                          <button
                            onClick={() => handleLearnConcept(p)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border border-border/60 text-text-secondary hover:text-text-primary transition-colors"
                          >
                            <BookOpen className="w-3 h-3" />
                            Learn
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
