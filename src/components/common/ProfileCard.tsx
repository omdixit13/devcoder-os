import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { GithubIcon } from './Icons';
import ExternalLink from './ExternalLink';
import { Code2, Edit2, Sparkles, User, Link as LinkIcon } from 'lucide-react';
import { extractHandle } from '../../utils/urlValidator';
import { soundManager } from '../../utils/soundManager';

interface ProfileCardProps {
  compact?: boolean;
  className?: string;
}

export default function ProfileCard({ compact = false, className = '' }: ProfileCardProps) {
  const {
    userName,
    githubProfileUrl,
    leetcodeProfileUrl,
    userCollege,
    userRole,
    isProfileConnected,
    setLoginModalOpen,
    leetcodeStats,
  } = useAppStore();

  const githubHandle = extractHandle(githubProfileUrl, 'github');
  const leetcodeHandle = extractHandle(leetcodeProfileUrl, 'leetcode');

  const displayName = userName?.trim() || 'Developer';
  const initial = displayName.slice(0, 2).toUpperCase();

  const handleOpenLogin = () => {
    soundManager.play('click');
    setLoginModalOpen(true);
  };

  if (compact) {
    return (
      <div className={`flex items-center justify-between gap-2 bg-surface-2 border border-border-default rounded-[10px] p-2.5 ${className}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-surface-4 flex items-center justify-center text-text-primary text-xs font-bold shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xs font-semibold text-accent-copper uppercase tracking-wider truncate">
              {displayName} / {isProfileConnected ? 'Connected' : 'Developer'}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {githubProfileUrl ? (
                <ExternalLink
                  href={githubProfileUrl}
                  className="text-2xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
                  iconSize={10}
                >
                  <GithubIcon size={11} />
                  GitHub
                </ExternalLink>
              ) : (
                <button
                  onClick={handleOpenLogin}
                  className="text-2xs text-text-tertiary hover:text-text-secondary flex items-center gap-1"
                >
                  + Add GitHub
                </button>
              )}

              <span className="text-2xs text-text-tertiary">·</span>

              {leetcodeProfileUrl ? (
                <ExternalLink
                  href={leetcodeProfileUrl}
                  className="text-2xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
                  iconSize={10}
                >
                  <Code2 size={11} className="text-accent-yellow" />
                  LeetCode
                </ExternalLink>
              ) : (
                <button
                  onClick={handleOpenLogin}
                  className="text-2xs text-text-tertiary hover:text-text-secondary flex items-center gap-1"
                >
                  + Add LeetCode
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenLogin}
          className="p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-3 transition-colors shrink-0"
          title="Edit Profile / Switch Accounts"
        >
          <Edit2 size={11} />
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-surface-2 border border-border-default rounded-[10px] p-4 relative overflow-hidden group ${className}`}>
      {/* Subtle top ambient accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-copper/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-surface-4 border border-border-subtle flex items-center justify-center text-text-primary font-bold text-sm shrink-0">
              {initial}
            </div>
            {isProfileConnected && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-green rounded-full border-2 border-surface-2" title="Connected" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold text-accent-copper uppercase tracking-wider">
                {displayName.toUpperCase()} / USER PROFILE
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-4 text-2xs text-text-tertiary border border-border-subtle">
                {userRole || 'Developer'}
              </span>
              {leetcodeStats && (
                <span className="px-2 py-0.2 rounded-full bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/30 text-2xs font-mono font-medium" title="Live Verified Solved Count">
                  LC: {leetcodeStats.totalSolved} solved
                </span>
              )}
              <button
                onClick={handleOpenLogin}
                className="opacity-60 hover:opacity-100 text-text-tertiary hover:text-accent-copper transition-opacity ml-1"
                title="Edit Developer Accounts / Login"
              >
                <Edit2 size={11} />
              </button>
            </div>
            <div className="text-sm font-semibold text-text-primary">
              {displayName} <span className="text-xs font-normal text-text-tertiary">({userCollege || 'Computer Science & Engineering'})</span>
            </div>
          </div>
        </div>

        {/* Right: Pill Links / Connect Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {githubProfileUrl ? (
            <ExternalLink
              href={githubProfileUrl}
              className="px-3.5 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default hover:border-border-strong text-xs font-medium transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5"
              tooltipText={githubHandle ? `Open GitHub: @${githubHandle}` : 'Open GitHub Profile'}
              iconSize={12}
            >
              <GithubIcon size={14} className="text-text-primary" />
              <span>GitHub</span>
            </ExternalLink>
          ) : (
            <button
              onClick={handleOpenLogin}
              className="px-3 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-tertiary hover:text-text-primary border border-border-default text-xs font-medium transition-all flex items-center gap-1"
            >
              <GithubIcon size={13} />
              <span>+ Connect GitHub</span>
            </button>
          )}

          {leetcodeProfileUrl ? (
            <ExternalLink
              href={leetcodeProfileUrl}
              className="px-3.5 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-primary border border-border-default hover:border-border-strong text-xs font-medium transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5"
              tooltipText={leetcodeHandle ? `Open LeetCode: @${leetcodeHandle}` : 'Open LeetCode Profile'}
              iconSize={12}
            >
              <Code2 size={14} className="text-accent-yellow" />
              <span>LeetCode</span>
            </ExternalLink>
          ) : (
            <button
              onClick={handleOpenLogin}
              className="px-3 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-text-tertiary hover:text-text-primary border border-border-default text-xs font-medium transition-all flex items-center gap-1"
            >
              <Code2 size={13} className="text-accent-yellow" />
              <span>+ Connect LeetCode</span>
            </button>
          )}

          {!isProfileConnected && (
            <button
              onClick={handleOpenLogin}
              className="px-3 py-1.5 rounded-full bg-paper-white text-surface-0 hover:bg-bone text-xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1 shadow-sm"
            >
              <Sparkles size={11} className="text-accent-copper" />
              <span>Login / Setup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
