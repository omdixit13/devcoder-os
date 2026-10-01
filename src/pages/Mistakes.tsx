import React from 'react';
import { Zap, Calendar, Tag, ChevronRight, AlertTriangle, Brain, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function MistakesPage() {
  const { mistakes, setCurrentPage, setBhaiTeachingConcept } = useAppStore();

  // Find recurring patterns
  const tagCounts: Record<string, number> = {};
  mistakes.forEach(m => m.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const recurringTags = Object.entries(tagCounts).filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full min-w-0">
        <div className="animate-fade-in">
          <h1 className="text-xl font-semibold text-text-primary mb-1">Mistake Notebook</h1>
          <p className="text-xs sm:text-sm text-text-tertiary">Learn from your mistakes. Track patterns. Improve.</p>
        </div>

        {/* Recurring Mistakes */}
        {recurringTags.length > 0 && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-xl p-4 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-accent-red" />
              <span className="text-sm font-medium text-accent-red">Recurring Patterns</span>
            </div>
            <div className="space-y-2">
              {recurringTags.map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between py-1.5 px-3 bg-surface-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <RefreshCw size={12} className="text-accent-red" />
                    <span className="text-sm text-text-secondary capitalize">{tag.replace('-', ' ')}</span>
                  </div>
                  <span className="text-2xs text-accent-red font-semibold">{count} mistakes</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setBhaiTeachingConcept(recurringTags[0]?.[0] || null); setCurrentPage('bhai'); }}
              className="mt-3 text-2xs text-accent-purple hover:text-purple-400 font-medium flex items-center gap-1"
            >
              <Brain size={12} /> Ask Bhai for targeted revision
            </button>
          </div>
        )}

        {/* Mistakes List */}
        <div className="space-y-3">
          {mistakes.map((mistake, i) => (
            <div key={mistake.id} className="bg-surface-2 border border-border-default rounded-xl p-5 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{mistake.concept}</h3>
                  <p className="text-2xs text-text-tertiary mt-0.5">Problem: {mistake.problemId}</p>
                </div>
                <div className="flex items-center gap-1 text-2xs text-text-tertiary">
                  <Calendar size={10} />
                  {new Date(mistake.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>

              <div className="space-y-3">
                <Section label="What I Tried" color="text-text-tertiary">{mistake.whatITried}</Section>
                <Section label="What Went Wrong" color="text-accent-red">{mistake.whatWentWrong}</Section>
                <Section label="Correct Idea" color="text-accent-green">{mistake.correctIdea}</Section>
                <Section label="How to Avoid" color="text-accent-blue">{mistake.howToAvoid}</Section>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-subtle">
                <div className="flex gap-1.5 flex-1">
                  {mistake.tags.map(tag => (
                    <span key={tag} className="bg-surface-4 text-text-tertiary text-2xs px-2 py-0.5 rounded-md">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-2xs text-text-tertiary">
                  <Calendar size={10} />
                  <span>Review: {new Date(mistake.reviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mistakes.length === 0 && (
          <div className="text-center py-16">
            <Zap size={40} className="text-text-tertiary mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">No mistakes recorded</h2>
            <p className="text-sm text-text-tertiary">When you make a mistake while practicing, save it here to track and improve.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <span className={`text-2xs font-semibold uppercase tracking-wider ${color}`}>{label}</span>
      <p className="text-sm text-text-secondary mt-0.5">{children}</p>
    </div>
  );
}
