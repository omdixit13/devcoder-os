import React, { useState, useMemo } from 'react';
import {
  Dumbbell, ExternalLink, CheckCircle2, Circle, AlertCircle,
  Lightbulb, Eye, ChevronDown, Filter, Search, Sparkles, BookOpen
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Problem, Difficulty } from '../types';

const difficultyColors: Record<Difficulty, { bg: string; text: string }> = {
  beginner: { bg: 'bg-accent-green/10', text: 'text-accent-green' },
  intermediate: { bg: 'bg-accent-yellow/10', text: 'text-accent-yellow' },
  advanced: { bg: 'bg-accent-red/10', text: 'text-accent-red' },
};

export default function PracticePage() {
  const { problems, updateProblemStatus, setCurrentPage, setBhaiTeachingConcept } = useAppStore();
  const [filter, setFilter] = useState<string>('all');
  const [diffFilter, setDiffFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [hintProblem, setHintProblem] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);

  const filtered = useMemo(() => {
    let result = [...problems];
    if (filter === 'unsolved') result = result.filter(p => p.status === 'unsolved');
    if (filter === 'attempted') result = result.filter(p => p.status === 'attempted');
    if (filter === 'solved') result = result.filter(p => p.status === 'solved');
    if (diffFilter !== 'all') result = result.filter(p => p.difficulty === diffFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.topic.some(t => t.toLowerCase().includes(q)));
    }
    return result;
  }, [problems, filter, diffFilter, search]);

  const stats = useMemo(() => ({
    total: problems.length,
    solved: problems.filter(p => p.status === 'solved').length,
    attempted: problems.filter(p => p.status === 'attempted').length,
    unsolved: problems.filter(p => p.status === 'unsolved').length,
  }), [problems]);

  const getHint = (problemId: string, level: number): string => {
    const hints: Record<number, string> = {
      0: 'Think about what property of the data you can exploit. Is it sorted? Can you divide the search space?',
      1: 'Key observation: If the array is sorted (or can be mapped to a sorted structure), you can eliminate half the search space at each step.',
      2: 'Approach: Use binary search. Define your search boundaries, calculate mid, and decide which half to keep based on your condition.',
      3: 'Full solution approach: Set low=0, high=n-1. While low<=high, calculate mid. Compare arr[mid] with target. Adjust boundaries accordingly. Return -1 if not found.',
    };
    return hints[level] || hints[3];
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full min-w-0">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-xl font-semibold text-text-primary mb-1">Practice</h1>
          <p className="text-xs sm:text-sm text-text-tertiary">Solve problems to build muscle memory.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-surface-2 border border-border-default rounded-xl p-3 text-center">
            <span className="text-lg font-semibold text-text-primary">{stats.total}</span>
            <span className="block text-2xs text-text-tertiary">Total</span>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-xl p-3 text-center">
            <span className="text-lg font-semibold text-accent-green">{stats.solved}</span>
            <span className="block text-2xs text-text-tertiary">Solved</span>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-xl p-3 text-center">
            <span className="text-lg font-semibold text-accent-yellow">{stats.attempted}</span>
            <span className="block text-2xs text-text-tertiary">Attempted</span>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-xl p-3 text-center">
            <span className="text-lg font-semibold text-text-tertiary">{stats.unsolved}</span>
            <span className="block text-2xs text-text-tertiary">Unsolved</span>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-surface-2 border border-border-default rounded-lg px-3 py-2 min-w-0">
            <Search size={14} className="text-text-tertiary shrink-0" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems..." className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none min-w-0" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
          <div className="flex gap-1 bg-surface-2 rounded-lg p-1 overflow-x-auto no-scrollbar">
            {['all', 'unsolved', 'attempted', 'solved'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${filter === f ? 'bg-surface-4 text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-surface-2 rounded-lg p-1">
            {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
              <button key={d} onClick={() => setDiffFilter(d)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${diffFilter === d ? 'bg-surface-4 text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Problem List */}
        <div className="space-y-2">
          {filtered.map((problem, i) => {
            const dc = difficultyColors[problem.difficulty];
            const showHints = hintProblem === problem.id;
            
            return (
              <div key={problem.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                <div className={`bg-surface-2 border border-border-default rounded-xl p-4 hover:border-border-strong transition-all ${showHints ? 'border-accent-purple/30' : ''}`}>
                  <div className="flex items-center gap-4">
                    {/* Status */}
                    <button
                      onClick={() => {
                        const next = problem.status === 'unsolved' ? 'attempted' : problem.status === 'attempted' ? 'solved' : 'unsolved';
                        updateProblemStatus(problem.id, next);
                      }}
                      className="shrink-0"
                      title="Toggle status"
                    >
                      {problem.status === 'solved' ? <CheckCircle2 size={18} className="text-accent-green" /> :
                       problem.status === 'attempted' ? <AlertCircle size={18} className="text-accent-yellow" /> :
                       <Circle size={18} className="text-text-tertiary" />}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{problem.title}</span>
                        <span className={`text-2xs font-medium px-2 py-0.5 rounded-full ${dc.bg} ${dc.text}`}>
                          {problem.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xs text-text-tertiary">{problem.platform}</span>
                        {problem.topic.map(t => (
                          <span key={t} className="text-2xs bg-surface-4 text-text-tertiary px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setHintProblem(showHints ? null : problem.id); setHintLevel(0); }}
                        className="flex items-center gap-1 text-2xs text-accent-purple hover:text-purple-400 bg-accent-purple/10 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Lightbulb size={12} />
                        Need Help
                      </button>
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-2xs text-accent-blue hover:text-blue-400 bg-accent-blue/10 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <ExternalLink size={12} />
                        Solve
                      </a>
                    </div>
                  </div>

                  {/* Hint System */}
                  {showHints && (
                    <div className="mt-3 pt-3 border-t border-border-subtle animate-fade-in">
                      <div className="bg-accent-purple/5 border border-accent-purple/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={12} className="text-accent-purple" />
                          <span className="text-2xs font-semibold text-accent-purple uppercase tracking-wider">
                            Hint {hintLevel + 1} of 4
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">{getHint(problem.id, hintLevel)}</p>
                        <div className="flex gap-2 mt-3">
                          {hintLevel < 3 && (
                            <button
                              onClick={() => setHintLevel(hintLevel + 1)}
                              className="text-2xs text-accent-purple hover:text-purple-400 font-medium"
                            >
                              {hintLevel < 2 ? 'Next hint →' : 'Show solution →'}
                            </button>
                          )}
                          <button
                            onClick={() => { setBhaiTeachingConcept(problem.conceptId); setCurrentPage('bhai'); }}
                            className="text-2xs text-accent-blue hover:text-blue-400 font-medium ml-auto"
                          >
                            Ask Bhai for help
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Dumbbell size={40} className="text-text-tertiary mx-auto mb-3" />
            <p className="text-sm text-text-tertiary">No problems found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
