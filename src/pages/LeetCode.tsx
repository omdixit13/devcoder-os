import React, { useMemo } from 'react';
import {
  Code2, Clock, Calendar, Trophy, Timer,
  ChevronRight, BarChart3, Target, Flame, Star, RefreshCw, CheckCircle2, Award
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { activityData } from '../data/mockData';
import ProfileCard from '../components/common/ProfileCard';
import ExternalLink from '../components/common/ExternalLink';

export default function LeetCodePage() {
  const { 
    contests, problems, setCurrentPage, leetcodeProfileUrl, setLoginModalOpen,
    leetcodeStats, isFetchingLeetCodeStats, fetchLeetCodeStatsAction 
  } = useAppStore();
  const now = new Date();
  const leetcodeHandle = leetcodeProfileUrl ? leetcodeProfileUrl.replace(/https?:\/\/leetcode\.com\/(u\/)?/i, '').replace(/\/$/, '') : '';

  const solvedByDifficulty = useMemo(() => {
    if (leetcodeStats) {
      return {
        beginner: leetcodeStats.easySolved,
        intermediate: leetcodeStats.mediumSolved,
        advanced: leetcodeStats.hardSolved,
        total: leetcodeStats.totalSolved,
      };
    }
    return {
      beginner: problems.filter(p => p.status === 'solved' && p.difficulty === 'beginner').length,
      intermediate: problems.filter(p => p.status === 'solved' && p.difficulty === 'intermediate').length,
      advanced: problems.filter(p => p.status === 'solved' && p.difficulty === 'advanced').length,
      total: problems.filter(p => p.status === 'solved').length,
    };
  }, [problems, leetcodeStats]);

  const upcomingContests = contests
    .filter(c => new Date(c.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const getCountdown = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  // Activity heatmap
  const weeks = useMemo(() => {
    const result: { date: string; count: number }[][] = [];
    let week: { date: string; count: number }[] = [];
    activityData.forEach((d, i) => {
      week.push(d);
      if (week.length === 7) {
        result.push(week);
        week = [];
      }
    });
    if (week.length) result.push(week);
    return result;
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between animate-fade-in gap-3">
          <div>
            <h1 className="text-xl font-semibold text-text-primary mb-1">LeetCode</h1>
            <p className="text-sm text-text-tertiary">Track contests, live solved statistics, and competitive programming.</p>
          </div>

          {leetcodeProfileUrl && (
            <button
              onClick={() => fetchLeetCodeStatsAction()}
              disabled={isFetchingLeetCodeStats}
              className="px-3.5 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-border-default text-xs text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <RefreshCw size={13} className={`text-accent-copper ${isFetchingLeetCodeStats ? 'animate-spin' : ''}`} />
              <span>{isFetchingLeetCodeStats ? 'Syncing...' : 'Sync Live Stats'}</span>
            </button>
          )}
        </div>

        {/* Profile Card */}
        <ProfileCard />

        {/* Live LeetCode Sync Banner */}
        {leetcodeStats ? (
          <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 animate-slide-up space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {leetcodeStats.userAvatar ? (
                  <img 
                    src={leetcodeStats.userAvatar} 
                    alt={leetcodeStats.username} 
                    className="w-10 h-10 rounded-full border border-border-default object-cover" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-4 flex items-center justify-center text-accent-yellow font-bold">
                    {leetcodeStats.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {leetcodeStats.realName || leetcodeStats.username}
                    </h3>
                    <span className="text-2xs px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/30 flex items-center gap-1 font-medium">
                      <CheckCircle2 size={10} /> Live Verified
                    </span>
                  </div>
                  <p className="text-2xs text-text-tertiary">
                    @{leetcodeStats.username} · Global Ranking: <span className="text-bone font-mono">#{leetcodeStats.ranking ? leetcodeStats.ranking.toLocaleString() : 'N/A'}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xs text-text-tertiary block">Acceptance Rate</span>
                <span className="text-sm font-bold text-accent-copper font-mono">{leetcodeStats.acceptanceRate}%</span>
                <span className="text-[10px] text-text-tertiary block">({leetcodeStats.totalSubmissions} submissions)</span>
              </div>
            </div>

            {/* Solved Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-2xs text-text-tertiary">
                <span>Total Solved Breakdown</span>
                <span className="font-mono text-text-secondary">{leetcodeStats.totalSolved} Problems</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-4 flex overflow-hidden">
                <div 
                  className="bg-accent-green transition-all duration-500" 
                  style={{ width: `${leetcodeStats.totalSolved ? (leetcodeStats.easySolved / leetcodeStats.totalSolved) * 100 : 0}%` }} 
                  title={`Easy: ${leetcodeStats.easySolved}`}
                />
                <div 
                  className="bg-accent-yellow transition-all duration-500" 
                  style={{ width: `${leetcodeStats.totalSolved ? (leetcodeStats.mediumSolved / leetcodeStats.totalSolved) * 100 : 0}%` }} 
                  title={`Medium: ${leetcodeStats.mediumSolved}`}
                />
                <div 
                  className="bg-accent-red transition-all duration-500" 
                  style={{ width: `${leetcodeStats.totalSolved ? (leetcodeStats.hardSolved / leetcodeStats.totalSolved) * 100 : 0}%` }} 
                  title={`Hard: ${leetcodeStats.hardSolved}`}
                />
              </div>
            </div>
          </div>
        ) : leetcodeProfileUrl && isFetchingLeetCodeStats ? (
          <div className="bg-surface-2 border border-border-default rounded-[10px] p-6 text-center animate-pulse text-xs text-text-tertiary">
            <RefreshCw size={18} className="animate-spin text-accent-copper mx-auto mb-2" />
            Fetching live statistics from LeetCode...
          </div>
        ) : null}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
          <div className="bg-surface-2 border border-border-default rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-text-primary font-mono">{solvedByDifficulty.total}</span>
            <span className="block text-2xs text-text-tertiary mt-1">Total Solved</span>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-accent-green font-mono">{solvedByDifficulty.beginner}</span>
            <span className="block text-2xs text-accent-green mt-1">Easy</span>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-accent-yellow font-mono">{solvedByDifficulty.intermediate}</span>
            <span className="block text-2xs text-accent-yellow mt-1">Medium</span>
          </div>
          <div className="bg-surface-2 border border-border-default rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-accent-red font-mono">{solvedByDifficulty.advanced}</span>
            <span className="block text-2xs text-accent-red mt-1">Hard</span>
          </div>
        </div>

        {/* Upcoming Contests */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Upcoming Contests</h3>
          <div className="space-y-3">
            {upcomingContests.map(contest => (
              <div key={contest.id} className="bg-surface-2 border border-border-default rounded-xl p-4 hover:border-border-strong transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-blue/10 text-accent-blue flex items-center justify-center shrink-0">
                    <Trophy size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-text-primary">{contest.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-2xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(contest.startTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(contest.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer size={10} />
                        {contest.duration} min
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <ExternalLink 
                      href={contest.url} 
                      className="text-2xs text-accent-blue hover:underline justify-end mt-1"
                      showIcon={true}
                      iconSize={10}
                    >
                      Register
                    </ExternalLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Activity (Last 90 Days)</h3>
          <div className="bg-surface-2 border border-border-default rounded-xl p-4">
            <div className="flex gap-[3px] overflow-x-auto pb-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day) => {
                    const intensity = day.count === 0 ? 'bg-surface-4' :
                      day.count <= 2 ? 'bg-accent-green/20' :
                      day.count <= 4 ? 'bg-accent-green/40' :
                      day.count <= 6 ? 'bg-accent-green/60' :
                      'bg-accent-green';
                    return (
                      <div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm ${intensity}`}
                        title={`${day.date}: ${day.count} submissions`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-2xs text-text-tertiary">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-surface-4" />
              <div className="w-3 h-3 rounded-sm bg-accent-green/20" />
              <div className="w-3 h-3 rounded-sm bg-accent-green/40" />
              <div className="w-3 h-3 rounded-sm bg-accent-green/60" />
              <div className="w-3 h-3 rounded-sm bg-accent-green" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <button
            onClick={() => setCurrentPage('practice')}
            className="bg-surface-2 border border-border-default rounded-xl p-4 hover:border-border-strong hover:bg-surface-3 transition-all flex items-center gap-3 group"
          >
            <Target size={18} className="text-accent-blue" />
            <div className="text-left">
              <span className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors">Practice Problems</span>
              <span className="block text-2xs text-text-tertiary">Solve topic-wise</span>
            </div>
            <ChevronRight size={14} className="text-text-tertiary ml-auto" />
          </button>
          {leetcodeProfileUrl ? (
            <ExternalLink
              href={leetcodeProfileUrl}
              className="bg-surface-2 border border-border-default rounded-[10px] p-4 hover:border-border-strong hover:bg-surface-3 transition-all flex items-center gap-3 group w-full text-left"
              tooltipText={leetcodeHandle ? `Open https://leetcode.com/u/${leetcodeHandle}` : 'Open LeetCode Profile'}
              showIcon={false}
            >
              <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 flex items-center justify-center text-accent-yellow shrink-0">
                <Code2 size={18} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary group-hover:text-accent-yellow transition-colors block truncate">
                  Open Profile {leetcodeHandle ? `(@${leetcodeHandle})` : ''}
                </span>
                <span className="block text-2xs text-text-tertiary">View stats on leetcode.com</span>
              </div>
              <ChevronRight size={14} className="text-text-tertiary ml-auto shrink-0" />
            </ExternalLink>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="bg-surface-2 border border-dashed border-border-default rounded-[10px] p-4 hover:border-accent-yellow/50 hover:bg-surface-3 transition-all flex items-center gap-3 group w-full text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-accent-yellow/10 flex items-center justify-center text-accent-yellow shrink-0">
                <Code2 size={18} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary group-hover:text-accent-yellow transition-colors block truncate">
                  Connect LeetCode Profile
                </span>
                <span className="block text-2xs text-text-tertiary">Enter your username to link profile</span>
              </div>
              <ChevronRight size={14} className="text-text-tertiary ml-auto shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
