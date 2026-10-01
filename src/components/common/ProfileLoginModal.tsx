import React, { useState, useEffect } from 'react';
import {
  X, Check, User, ArrowRight, RefreshCw, Sparkles, ExternalLink as ExternalLinkIcon,
  Lock, Mail, AlertTriangle, ShieldCheck, LogOut, KeyRound, Globe, CheckCircle2
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { useAppStore } from '../../store/useAppStore';
import { extractHandle, normalizeProfileUrl } from '../../utils/urlValidator';
import { soundManager } from '../../utils/soundManager';
import { authService, type AuthUser } from '../../services/authService';

type AuthTab = 'profile' | 'login' | 'signup' | 'forgot';

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

  const [activeTab, setActiveTab] = useState<AuthTab>(isProfileConnected ? 'profile' : 'signup');

  // Profile Form state
  const [name, setName] = useState(userName || '');
  const [githubInput, setGithubInput] = useState('');
  const [leetcodeInput, setLeetcodeInput] = useState('');
  const [role, setRole] = useState(userRole || '');
  const [college, setCollege] = useState(userCollege || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [targetCareer, setTargetCareer] = useState('Full Stack / Software Engineer');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [oauthWarning, setOauthWarning] = useState<string | null>(null);

  // Sync inputs when modal opens
  useEffect(() => {
    if (loginModalOpen) {
      setActiveTab(isProfileConnected ? 'profile' : 'signup');
      setName(userName || '');
      setGithubInput(githubProfileUrl ? extractHandle(githubProfileUrl, 'github') : '');
      setLeetcodeInput(leetcodeProfileUrl ? extractHandle(leetcodeProfileUrl, 'leetcode') : '');
      setRole(userRole || 'Aspiring Software Engineer');
      setCollege(userCollege || '');
      setSavedSuccess(false);
      setAuthError(null);
      setAuthSuccess(null);
      setOauthWarning(null);
    }
  }, [loginModalOpen, isProfileConnected, userName, githubProfileUrl, leetcodeProfileUrl, userRole, userCollege]);

  if (!loginModalOpen) return null;

  const currentGhHandle = extractHandle(githubInput, 'github');
  const currentLcHandle = extractHandle(leetcodeInput, 'leetcode');
  const previewGhUrl = currentGhHandle ? `https://github.com/${currentGhHandle}` : '';
  const previewLcUrl = currentLcHandle ? `https://leetcode.com/u/${currentLcHandle}` : '';

  const handleSaveProfile = (e: React.FormEvent) => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const res = await authService.login({ email, password });
    if (!res.success || !res.user) {
      setAuthError(res.error || 'Login failed. Please check your credentials.');
      soundManager.play('error');
      return;
    }

    soundManager.play('milestone');
    setAuthSuccess(`Welcome back, ${res.user.name}!`);
    connectAccounts({
      name: res.user.name,
      github: res.user.githubProfileUrl || githubInput,
      leetcode: res.user.leetcodeProfileUrl || leetcodeInput,
      role: res.user.role || role,
      college: res.user.college || college,
    });
    setTimeout(() => {
      setLoginModalOpen(false);
    }, 800);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const res = await authService.signup({
      name: signupName,
      email,
      password,
      targetCareer,
    });

    if (!res.success || !res.user) {
      setAuthError(res.error || 'Signup failed.');
      soundManager.play('error');
      return;
    }

    soundManager.play('milestone');
    setAuthSuccess(`Account created securely for ${res.user.name}!`);
    connectAccounts({
      name: res.user.name,
      github: githubInput,
      leetcode: leetcodeInput,
      role: targetCareer,
      college: college || 'Computer Science',
    });
    setTimeout(() => {
      setLoginModalOpen(false);
    }, 800);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const res = await authService.requestPasswordReset(email);
    if (!res.success) {
      setAuthError(res.message);
      soundManager.play('error');
    } else {
      setAuthSuccess(res.message);
      soundManager.play('click');
    }
  };

  const handleOAuthClick = (provider: 'Google' | 'GitHub') => {
    const { googleConfigured, githubConfigured } = authService.getOAuthConfigurationStatus();
    soundManager.play('click');

    if (provider === 'Google' && !googleConfigured) {
      setOauthWarning('Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID or use Email/Password authentication.');
      return;
    }
    if (provider === 'GitHub' && !githubConfigured) {
      setOauthWarning('GitHub OAuth is not configured. Please set VITE_GITHUB_CLIENT_ID or connect your public GitHub username below.');
      return;
    }
  };

  const handleDisconnect = () => {
    authService.logout();
    disconnectAccounts();
    setName('Developer');
    setGithubInput('');
    setLeetcodeInput('');
    setLoginModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-surface-0/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg max-h-[calc(100dvh-2rem)] bg-surface-1 border border-border-default rounded-[14px] shadow-2xl overflow-hidden relative flex flex-col my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Top copper line accent */}
        <div className="h-[2px] w-full bg-gradient-to-r from-accent-copper/20 via-accent-copper to-accent-copper/20" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border-default flex items-center justify-between bg-surface-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-3 border border-border-subtle flex items-center justify-center text-accent-copper shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                {activeTab === 'profile' ? 'Developer Profile & Accounts' :
                 activeTab === 'login' ? 'Sign In to DevCareer OS' :
                 activeTab === 'signup' ? 'Create Your Account' : 'Reset Password'}
              </h2>
              <p className="text-3xs text-text-tertiary">
                Secure salted credentials & personalized profile tracking
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.play('click');
              setLoginModalOpen(false);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-3 transition-colors shrink-0"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs (Phase 14) */}
        <div className="flex items-center border-b border-border-subtle bg-surface-1 px-4 sm:px-6 pt-2 overflow-x-auto no-scrollbar shrink-0">
          {(['profile', 'login', 'signup', 'forgot'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setAuthError(null);
                setAuthSuccess(null);
                setOauthWarning(null);
              }}
              className={`px-3 py-2 text-2xs font-medium border-b-2 capitalize transition-all ${
                activeTab === tab
                  ? 'border-accent-copper text-text-primary font-semibold'
                  : 'border-transparent text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {tab === 'profile' ? 'Profile & Links' :
               tab === 'login' ? 'Sign In' :
               tab === 'signup' ? 'Sign Up' : 'Forgot Password'}
            </button>
          ))}
        </div>

        {/* Status / Warning Messages */}
        {authError && (
          <div className="mx-6 mt-4 p-2.5 rounded-[8px] bg-accent-red/10 border border-accent-red/20 text-accent-red text-2xs flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{authError}</span>
          </div>
        )}
        {authSuccess && (
          <div className="mx-6 mt-4 p-2.5 rounded-[8px] bg-accent-green/10 border border-accent-green/20 text-accent-green text-2xs flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{authSuccess}</span>
          </div>
        )}
        {oauthWarning && (
          <div className="mx-6 mt-4 p-2.5 rounded-[8px] bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow text-2xs flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{oauthWarning}</span>
          </div>
        )}

        {/* TAB 1: Profile & Handles */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100dvh-12rem)]">
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Your Full Name"
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
                  GitHub Profile Handle or URL
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
                placeholder="e.g. username or https://github.com/username"
                className="w-full bg-surface-2 border border-border-default focus:border-border-strong rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
              />
              {previewGhUrl && (
                <p className="text-2xs text-text-tertiary mt-1 flex items-center gap-1 font-mono truncate">
                  <span>URL:</span>
                  <span className="text-text-secondary">{previewGhUrl}</span>
                </p>
              )}
            </div>

            {/* LeetCode Input */}
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="text-accent-yellow font-bold text-xs">LC</span>
                  LeetCode Profile Handle or URL
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
                placeholder="e.g. username or https://leetcode.com/u/username"
                className="w-full bg-surface-2 border border-border-default focus:border-border-strong rounded-lg px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
              />
              {previewLcUrl && (
                <p className="text-2xs text-text-tertiary mt-1 flex items-center gap-1 font-mono truncate">
                  <span>URL:</span>
                  <span className="text-text-secondary">{previewLcUrl}</span>
                </p>
              )}
            </div>

            {/* Role & College */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Role / Target Track
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
              {isProfileConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-2xs text-accent-red hover:underline flex items-center gap-1 transition-colors"
                >
                  <LogOut size={11} />
                  Log Out / Reset
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(false)}
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
                      Saved!
                    </>
                  ) : (
                    <>
                      <span>Save Profile</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: Sign In */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100dvh-12rem)]">
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full bg-surface-2 border border-border-default rounded-lg px-3.5 py-2 text-xs text-text-primary outline-none focus:border-border-strong"
                  required
                />
                <Mail size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-2 border border-border-default rounded-lg px-3.5 py-2 text-xs text-text-primary outline-none focus:border-border-strong"
                  required
                />
                <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('forgot')}
                className="text-3xs text-accent-copper hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-white text-surface-0 font-semibold text-xs hover:bg-bone transition-all shadow-sm"
            >
              Sign In Securely
            </button>

            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle" /></div>
              <span className="relative bg-surface-1 px-2 text-3xs text-text-quaternary uppercase">Or continue with</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOAuthClick('Google')}
                className="py-2 px-3 rounded-lg border border-border-default bg-surface-2 text-text-secondary hover:text-text-primary text-2xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Globe size={13} />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthClick('GitHub')}
                className="py-2 px-3 rounded-lg border border-border-default bg-surface-2 text-text-secondary hover:text-text-primary text-2xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <GithubIcon size={13} />
                GitHub
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Sign Up */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignup} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100dvh-12rem)]">
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
                placeholder="e.g. Your Full Name"
                className="w-full bg-surface-2 border border-border-default rounded-lg px-3.5 py-2 text-xs text-text-primary outline-none focus:border-border-strong"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-surface-2 border border-border-default rounded-lg px-3.5 py-2 text-xs text-text-primary outline-none focus:border-border-strong"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Create Password (min. 6 characters)
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-2 border border-border-default rounded-lg px-3.5 py-2 text-xs text-text-primary outline-none focus:border-border-strong"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Target Career Path
              </label>
              <select
                value={targetCareer}
                onChange={e => setTargetCareer(e.target.value)}
                className="w-full bg-surface-2 border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary outline-none"
              >
                <option value="Full Stack / Software Engineer">Full Stack / Software Engineer</option>
                <option value="Backend / Systems Engineer">Backend / Systems Engineer</option>
                <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                <option value="Cybersecurity / Security Analyst">Cybersecurity / Security Analyst</option>
                <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer</option>
                <option value="Data Engineer">Data Engineer</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-white text-surface-0 font-semibold text-xs hover:bg-bone transition-all shadow-sm"
            >
              Create Account
            </button>
          </form>
        )}

        {/* TAB 4: Forgot Password */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100dvh-12rem)]">
            <p className="text-xs text-text-secondary leading-relaxed">
              Enter your registered email address to receive password reset instructions.
            </p>
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-surface-2 border border-border-default rounded-lg px-3.5 py-2 text-xs text-text-primary outline-none focus:border-border-strong"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-white text-surface-0 font-semibold text-xs hover:bg-bone transition-all shadow-sm"
            >
              Submit Reset Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
