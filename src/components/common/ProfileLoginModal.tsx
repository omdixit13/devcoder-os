import React, { useState, useEffect } from 'react';
import { X, Check, User, ArrowRight, RefreshCw, Sparkles, ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { GithubIcon } from './Icons';
import { useAppStore } from '../../store/useAppStore';
import { extractHandle, normalizeProfileUrl } from '../../utils/urlValidator';
import { soundManager } from '../../utils/soundManager';

export default function ProfileLoginModal() {
  const {
    loginModalOpen,
    setLoginModalOpen,
    userName,
    githubProfileUrl,
    leetcodeProfileUrl,
    userRole,
    userCollege,
    isProfileConnected,
    connectAccounts,
    disconnectAccounts,
  } = useAppStore();

  const [name, setName] = useState(userName || '');
  const [githubInput, setGithubInput] = useState('');
  const [leetcodeInput, setLeetcodeInput] = useState('');
  const [role, setRole] = useState(userRole || '');
  const [college, setCollege] = useState(userCollege || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync inputs when modal opens
  useEffect(() => {
    if (loginModalOpen) {
      setName(userName || '');
      setGithubInput(githubProfileUrl ? extractHandle(githubProfileUrl, 'github') : '');
      setLeetcodeInput(leetcodeProfileUrl ? extractHandle(leetcodeProfileUrl, 'leetcode') : '');
      setRole(userRole || 'B.Tech CSE Student');
      setCollege(userCollege || 'Computer Science & Engineering');
      setSavedSuccess(false);
    }
  }, [loginModalOpen, userName, githubProfileUrl, leetcodeProfileUrl, userRole, userCollege]);

  if (!loginModalOpen) return null;

  const currentGhHandle = extractHandle(githubInput, 'github');
  const currentLcHandle = extractHandle(leetcodeInput, 'leetcode');

  const previewGhUrl = currentGhHandle ? `https://github.com/${currentGhHandle}` : '';
  const previewLcUrl = currentLcHandle ? `https://leetcode.com/u/${currentLcHandle}` : '';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    connectAccounts({
      name: name.trim() || 'Developer',
      github: githubInput.trim(),
      leetcode: leetcodeInput.trim(),
      role: role.trim() || 'Software Engineer',
      college: college.trim() || 'Computer Science & Engineering',
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setLoginModalOpen(false);
      setSavedSuccess(false);
    }, 600);
  };

  const handleDisconnect = () => {
    disconnectAccounts();
    setName('Developer');
    setGithubInput('');
    setLeetcodeInput('');
    setLoginModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-0/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-surface-1 border border-border-default rounded-[14px] shadow-2xl overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Top copper line accent */}
        <div className="h-[2px] w-full bg-gradient-to-r from-accent-copper/20 via-accent-copper to-accent-copper/20" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-3 border border-border-subtle flex items-center justify-center text-accent-copper">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary tracking-tight">
                {isProfileConnected ? 'Developer Profile & Accounts' : 'Connect Your Developer Accounts'}
              </h2>
              <p className="text-2xs text-text-tertiary">
                Login with your own LeetCode & GitHub to personalize this OS
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.play('click');
              setLoginModalOpen(false);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-3 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* User Name */}
          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Your Name / Nickname
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Om or your name"
                className="w-full bg-surface-2 border border-border-default focus:border-border-strong rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
                required
              />
              <User size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            </div>
          </div>

          {/* GitHub Input */}
          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GithubIcon size={12} className="text-text-primary" />
                GitHub Handle or URL
              </span>
              {currentGhHandle && (
                <span className="text-2xs text-accent-copper font-normal lowercase">
                  @{currentGhHandle}
                </span>
              )}
            </label>
            <input
              type="text"
              value={githubInput}
              onChange={(e) => setGithubInput(e.target.value)}
              placeholder="e.g. your-github-username or https://github.com/..."
              className="w-full bg-surface-2 border border-border-default focus:border-border-strong rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
            />
            {previewGhUrl && (
              <p className="text-2xs text-text-tertiary mt-1 flex items-center gap-1">
                <span>Profile link:</span>
                <span className="text-text-secondary font-mono truncate">{previewGhUrl}</span>
              </p>
            )}
          </div>

          {/* LeetCode Input */}
          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="text-accent-yellow font-bold text-xs">LC</span>
                LeetCode Handle or URL
              </span>
              {currentLcHandle && (
                <span className="text-2xs text-accent-yellow font-normal lowercase">
                  @{currentLcHandle}
                </span>
              )}
            </label>
            <input
              type="text"
              value={leetcodeInput}
              onChange={(e) => setLeetcodeInput(e.target.value)}
              placeholder="e.g. your-leetcode-username or https://leetcode.com/u/..."
              className="w-full bg-surface-2 border border-border-default focus:border-border-strong rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
            />
            {previewLcUrl && (
              <p className="text-2xs text-text-tertiary mt-1 flex items-center gap-1">
                <span>Profile link:</span>
                <span className="text-text-secondary font-mono truncate">{previewLcUrl}</span>
              </p>
            )}
          </div>

          {/* Role & College (2 cols) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. B.Tech CSE Student"
                className="w-full bg-surface-2 border border-border-default focus:border-border-strong rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                College / Branch
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full bg-surface-2 border border-border-default focus:border-border-strong rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border-default flex items-center justify-between gap-3">
            {isProfileConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-2xs text-accent-red hover:underline flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={11} />
                Switch / Reset to Guest
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLoginModalOpen(false)}
                className="text-2xs text-text-tertiary hover:text-text-primary transition-colors"
              >
                Continue as Guest
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => {
                  soundManager.play('click');
                  setLoginModalOpen(false);
                }}
                className="px-4 py-2 rounded-full border border-border-default hover:bg-surface-3 text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-paper-white text-surface-0 hover:bg-bone text-xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-md"
              >
                {savedSuccess ? (
                  <>
                    <Check size={14} className="text-accent-green" />
                    Connected!
                  </>
                ) : (
                  <>
                    <span>Save & Connect</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
