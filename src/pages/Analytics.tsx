import React, { useMemo } from 'react';
import {
  BarChart3, Clock, Target, Brain, Flame, TrendingUp,
  BookOpen, Dumbbell, CheckCircle2, AlertTriangle, Calendar
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { activityData } from '../data/mockData';

export default function AnalyticsPage() {
  const { skills, problems, reviews, dailyStats, mistakes } = useAppStore();

  const solvedCount = problems.filter(p => p.status === 'solved').length;
  const masteredSkills = skills.filter(s => s.status === 'mastered').length;
  const learningSkills = skills.filter(s => s.status === 'learning').length;
  const totalReviews = reviews.reduce((acc, r) => acc + r.reviewCount, 0);
  
  // Weekly stats (simulated)
  const weeklyLearning = [45, 32, 60, 38, 55, 42, 50];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxLearning = Math.max(...weeklyLearning);

  // Topic distribution
  const topicStats = useMemo(() => {
    const topics: Record<string, { solved: number; total: number }> = {};
    problems.forEach(p => {
      p.topic.forEach(t => {
        if (!topics[t]) topics[t] = { solved: 0, total: 0 };
        topics[t].total++;
        if (p.status === 'solved') topics[t].solved++;
      });
    });
    return Object.entries(topics).sort((a, b) => b[1].total - a[1].total);
  }, [problems]);

  // Weak topics
  const weakTopics = useMemo(() => {
    return skills
      .filter(s => s.status === 'learning' || s.status === 'needs_revision')
      .map(s => ({ name: s.name, progress: Math.round((s.completedConcepts / s.conceptCount) * 100) }))
      .sort((a, b) => a.progress - b.progress)
      .slice(0, 5);
  }, [skills]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-xl font-semibold text-text-primary mb-1">Analytics</h1>
          <p className="text-sm text-text-tertiary">Your learning journey at a glance.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-3 animate-slide-up">
          {[
            { icon: <Target size={16} />, label: 'Problems Solved', value: solvedCount, color: 'text-accent-green' },
            { icon: <CheckCircle2 size={16} />, label: 'Skills Mastered', value: masteredSkills, color: 'text-accent-blue' },
            { icon: <BookOpen size={16} />, label: 'Currently Learning', value: learningSkills, color: 'text-accent-yellow' },
            { icon: <Brain size={16} />, label: 'Total Reviews', value: totalReviews, color: 'text-accent-purple' },
            { icon: <Flame size={16} />, label: 'Day Streak', value: 7, color: 'text-accent-red' },
          ].map((metric, i) => (
            <div key={i} className="bg-surface-2 border border-border-default rounded-xl p-3">
              <span className={metric.color}>{metric.icon}</span>
              <div className="text-xl font-bold text-text-primary mt-2">{metric.value}</div>
              <div className="text-2xs text-text-tertiary">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Weekly Learning Chart */}
        <div className="bg-surface-2 border border-border-default rounded-xl p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-medium text-text-primary mb-4">Learning Time (This Week)</h3>
          <div className="flex items-end gap-3 h-32">
            {weeklyLearning.map((mins, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-2xs text-text-tertiary">{mins}m</span>
                <div className="w-full rounded-t-md bg-accent-blue/80 transition-all hover:bg-accent-blue" style={{ height: `${(mins / maxLearning) * 100}%` }} />
                <span className="text-2xs text-text-tertiary">{weekDays[i]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
            <span className="text-sm text-text-secondary">Total: {weeklyLearning.reduce((a, b) => a + b, 0)} min</span>
            <span className="text-sm text-accent-green flex items-center gap-1">
              <TrendingUp size={14} /> +12% from last week
            </span>
          </div>
        </div>

        {/* Topic Distribution */}
        <div className="bg-surface-2 border border-border-default rounded-xl p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-sm font-medium text-text-primary mb-4">Problems by Topic</h3>
          <div className="space-y-3">
            {topicStats.map(([topic, stats]) => (
              <div key={topic} className="flex items-center gap-3">
                <span className="text-sm text-text-secondary w-32 truncate capitalize">{topic.replace('-', ' ')}</span>
                <div className="flex-1 bg-surface-4 rounded-full h-2">
                  <div
                    className="bg-accent-blue h-2 rounded-full transition-all"
                    style={{ width: `${(stats.solved / Math.max(stats.total, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-2xs text-text-tertiary w-12 text-right">{stats.solved}/{stats.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="bg-surface-2 border border-border-default rounded-xl p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-accent-yellow" />
            <h3 className="text-sm font-medium text-text-primary">Weak Topics — Focus Here</h3>
          </div>
          <div className="space-y-3">
            {weakTopics.map(topic => (
              <div key={topic.name} className="flex items-center gap-3">
                <span className="text-sm text-text-secondary w-40 truncate">{topic.name}</span>
                <div className="flex-1 bg-surface-4 rounded-full h-2">
                  <div
                    className="bg-accent-yellow h-2 rounded-full transition-all"
                    style={{ width: `${topic.progress}%` }}
                  />
                </div>
                <span className="text-2xs text-text-tertiary w-10 text-right">{topic.progress}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spaced Repetition Health */}
        <div className="bg-surface-2 border border-border-default rounded-xl p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-sm font-medium text-text-primary mb-4">Review Health</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-accent-green/10 rounded-lg p-3 text-center">
              <span className="text-lg font-semibold text-accent-green">{reviews.filter(r => r.reviewCount >= 3).length}</span>
              <span className="block text-2xs text-text-tertiary">Strong</span>
            </div>
            <div className="bg-accent-yellow/10 rounded-lg p-3 text-center">
              <span className="text-lg font-semibold text-accent-yellow">{reviews.filter(r => r.reviewCount < 3 && r.reviewCount > 0).length}</span>
              <span className="block text-2xs text-text-tertiary">Needs Practice</span>
            </div>
            <div className="bg-accent-red/10 rounded-lg p-3 text-center">
              <span className="text-lg font-semibold text-accent-red">{reviews.filter(r => new Date(r.nextReview) < new Date()).length}</span>
              <span className="block text-2xs text-text-tertiary">Overdue</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
