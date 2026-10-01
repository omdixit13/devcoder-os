import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, User, Palette, Bell, Database,
  Info, Moon, Sun, Monitor, Volume2, VolumeX, Sparkles, Check, Play, RefreshCw, LogIn
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ProfileCard from '../components/common/ProfileCard';
import ExternalLink from '../components/common/ExternalLink';
import { soundManager } from '../utils/soundManager';
import { triggerConfetti } from '../utils/confetti';
import { normalizeProfileUrl } from '../utils/urlValidator';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const {
    userName,
    githubProfileUrl,
    leetcodeProfileUrl,
    userRole,
    userCollege,
    isProfileConnected,
    setLoginModalOpen,
    disconnectAccounts,
    updateUserProfile,
    soundEnabled,
    soundVolume,
    reducedMotion,
    setSoundEnabled,
    setSoundVolume,
    setReducedMotion,
  } = useAppStore();

  const [formName, setFormName] = useState(userName);
  const [formGithub, setFormGithub] = useState(githubProfileUrl);
  const [formLeetcode, setFormLeetcode] = useState(leetcodeProfileUrl);
  const [formRole, setFormRole] = useState(userRole || 'B.Tech CSE');
  const [formCollege, setFormCollege] = useState(userCollege || 'Computer Science & Engineering');

  useEffect(() => {
    setFormName(userName);
    setFormGithub(githubProfileUrl);
    setFormLeetcode(leetcodeProfileUrl);
    setFormRole(userRole || 'B.Tech CSE');
    setFormCollege(userCollege || 'Computer Science & Engineering');
  }, [userName, githubProfileUrl, leetcodeProfileUrl, userRole, userCollege]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const ghUrl = normalizeProfileUrl(formGithub, 'github');
    const lcUrl = normalizeProfileUrl(formLeetcode, 'leetcode');
    updateUserProfile({
      userName: formName.trim() || 'Developer',
      githubProfileUrl: ghUrl,
      leetcodeProfileUrl: lcUrl,
      userRole: formRole.trim(),
      userCollege: formCollege.trim(),
      isProfileConnected: Boolean(ghUrl || lcUrl),
    });
    setFormGithub(ghUrl);
    setFormLeetcode(lcUrl);
    soundManager.play('taskCompleted');
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const sections = [
    { id: 'profile', label: 'Profile & Links', icon: <User size={16} /> },
    { id: 'sound', label: 'Sound & Motion', icon: <Volume2 size={16} /> },
    { id: 'general', label: 'General', icon: <SettingsIcon size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'data', label: 'Data', icon: <Database size={16} /> },
    { id: 'about', label: 'About', icon: <Info size={16} /> },
  ];

  return (
    <div className="h-full flex">
      {/* Settings Nav */}
      <div className="w-[220px] bg-surface-1 border-r border-border-default p-4 shrink-0">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Settings</h2>
        <div className="space-y-0.5">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => {
                soundManager.play('buttonClick');
                setActiveSection(s.id);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium transition-colors ${
                activeSection === s.id
                  ? 'bg-surface-3 text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              <span className={activeSection === s.id ? 'text-accent-copper' : 'text-text-tertiary'}>
                {s.icon}
              </span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">

          {/* SECTION: PROFILE & LINKS */}
          {activeSection === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Personal Profile Links</h3>
                <p className="text-xs text-text-tertiary">
                  Manage your persistent LeetCode and GitHub identity across DevCareer OS.
                </p>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-2">
                <span className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Live Profile Card Preview
                </span>
                <ProfileCard />
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 bg-surface-2 border border-border-default rounded-[10px] p-5">
                <SettingRow
                  title="Display Name"
                  description="Your name across greetings, Bhai chats, and profile cards"
                >
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="bg-surface-3 border border-border-default rounded-[10px] px-3 py-1.5 text-xs text-text-primary w-56 outline-none focus:border-border-strong transition-colors"
                  />
                </SettingRow>

                <SettingRow
                  title="College / Course"
                  description="e.g. B.Tech Computer Science & Engineering"
                >
                  <input
                    type="text"
                    value={formCollege}
                    onChange={e => setFormCollege(e.target.value)}
                    className="bg-surface-3 border border-border-default rounded-[10px] px-3 py-1.5 text-xs text-text-primary w-56 outline-none focus:border-border-strong transition-colors"
                  />
                </SettingRow>

                <SettingRow
                  title="Academic Stage / Role"
                  description="e.g. 2nd Year B.Tech CSE"
                >
                  <input
                    type="text"
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className="bg-surface-3 border border-border-default rounded-[10px] px-3 py-1.5 text-xs text-text-primary w-56 outline-none focus:border-border-strong transition-colors"
                  />
                </SettingRow>

                {/* GitHub Profile URL */}
                <SettingRow
                  title="GitHub Profile URL"
                  description="Your public GitHub profile URL (e.g. https://github.com/omdixit13). Click test to open in browser."
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={formGithub}
                      onChange={e => setFormGithub(e.target.value)}
                      placeholder="https://github.com/omdixit13"
                      className="bg-surface-3 border border-border-default rounded-[10px] px-3 py-1.5 text-xs text-text-primary w-64 outline-none focus:border-border-strong font-mono transition-colors"
                    />
                    <ExternalLink
                      href={formGithub}
                      className="px-2.5 py-1.5 rounded-full bg-surface-4 text-text-secondary hover:text-text-primary text-2xs font-medium border border-border-subtle shrink-0"
                      tooltipText="Test opening in default browser"
                    >
                      Test
                    </ExternalLink>
                  </div>
                </SettingRow>

                {/* LeetCode Profile URL */}
                <SettingRow
                  title="LeetCode Profile URL"
                  description="Your public LeetCode user profile URL (e.g. https://leetcode.com/u/omdixit13)"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={formLeetcode}
                      onChange={e => setFormLeetcode(e.target.value)}
                      placeholder="https://leetcode.com/u/omdixit13"
                      className="bg-surface-3 border border-border-default rounded-[10px] px-3 py-1.5 text-xs text-text-primary w-64 outline-none focus:border-border-strong font-mono transition-colors"
                    />
                    <ExternalLink
                      href={formLeetcode}
                      className="px-2.5 py-1.5 rounded-full bg-surface-4 text-text-secondary hover:text-text-primary text-2xs font-medium border border-border-subtle shrink-0"
                      tooltipText="Test opening in default browser"
                    >
                      Test
                    </ExternalLink>
                  </div>
                </SettingRow>

                <div className="pt-3 flex items-center justify-between border-t border-border-subtle flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    {savedFeedback ? (
                      <span className="text-xs text-accent-green font-medium flex items-center gap-1.5 animate-fade-in">
                        <Check size={14} /> Profile preferences saved!
                      </span>
                    ) : (
                      <span className="text-2xs text-text-tertiary">
                        Changes persist across application restarts.
                      </span>
                    )}

                    {isProfileConnected && (
                      <button
                        type="button"
                        onClick={disconnectAccounts}
                        className="text-2xs text-accent-red hover:underline flex items-center gap-1 transition-colors ml-2"
                      >
                        <RefreshCw size={11} />
                        Reset / Disconnect
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginModalOpen(true)}
                      className="px-3.5 py-2 rounded-full border border-border-default hover:bg-surface-3 text-text-primary text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles size={12} className="text-accent-copper" />
                      Guided Setup
                    </button>
                    <button
                      type="submit"
                      className="bg-paper-white hover:bg-white/90 text-obsidian px-5 py-2 rounded-full text-xs font-semibold transition-all active:scale-[0.98] shadow-sm"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* SECTION: SOUND & MOTION */}
          {activeSection === 'sound' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Sound & Motion</h3>
                <p className="text-xs text-text-tertiary">
                  Calm acoustic reinforcement and motion accessibility preferences.
                </p>
              </div>

              <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
                <SettingRow
                  title="Sound Effects"
                  description="Subtle acoustic cues on task completion, concept mastery, and transitions"
                >
                  <Toggle
                    checked={soundEnabled}
                    onChange={(val) => setSoundEnabled(val)}
                  />
                </SettingRow>

                <SettingRow
                  title="Master Volume"
                  description={`Current volume level: ${soundVolume}% (calm studio normalization)`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={soundVolume}
                      disabled={!soundEnabled}
                      onChange={(e) => setSoundVolume(parseInt(e.target.value, 10))}
                      className="w-32 accent-accent-copper cursor-pointer"
                    />
                    <span className="text-xs font-mono text-text-secondary w-8 text-right">
                      {soundVolume}%
                    </span>
                    <button
                      type="button"
                      disabled={!soundEnabled}
                      onClick={() => soundManager.play('conceptCompleted')}
                      className="px-2.5 py-1 rounded-full bg-surface-3 hover:bg-surface-4 text-2xs text-text-primary border border-border-default transition-all flex items-center gap-1"
                    >
                      <Play size={10} /> Play Sample
                    </button>
                  </div>
                </SettingRow>

                <SettingRow
                  title="Reduced Motion Accessibility"
                  description="Disables celebratory confetti and minimizes UI motion animations"
                >
                  <Toggle
                    checked={reducedMotion}
                    onChange={(val) => setReducedMotion(val)}
                  />
                </SettingRow>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <div className="text-2xs text-text-tertiary">
                    {reducedMotion ? 'Reduced motion active — confetti disabled.' : 'Motion active — subtle celebratory confetti enabled.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!reducedMotion) {
                        soundManager.play('milestone');
                        triggerConfetti();
                      }
                    }}
                    disabled={reducedMotion}
                    className="px-3.5 py-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-xs text-text-primary border border-border-default transition-all flex items-center gap-1.5 disabled:opacity-30"
                  >
                    <Sparkles size={12} className="text-accent-copper" />
                    Test Achievement Confetti
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: GENERAL */}
          {activeSection === 'general' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">General</h3>
                <p className="text-xs text-text-tertiary">Basic application settings.</p>
              </div>
              <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
                <SettingRow title="Daily Learning Goal" description="Target learning time per day">
                  <select className="bg-surface-3 border border-border-default rounded-[10px] px-3 py-1.5 text-xs text-text-primary outline-none">
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option>1 hour</option>
                    <option>1.5 hours</option>
                    <option>2 hours</option>
                  </select>
                </SettingRow>
                <SettingRow title="Session Length" description="Default practice session duration">
                  <select className="bg-surface-3 border border-border-default rounded-[10px] px-3 py-1.5 text-xs text-text-primary outline-none">
                    <option>15 minutes</option>
                    <option>25 minutes</option>
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                  </select>
                </SettingRow>
              </div>
            </div>
          )}

          {/* SECTION: APPEARANCE */}
          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Appearance</h3>
                <p className="text-xs text-text-tertiary">Slash Midnight Vault design system active.</p>
              </div>
              <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
                <SettingRow title="Theme Palette" description="Midnight vault with gilded ledger lines">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-3 border border-accent-copper/40 text-xs text-text-primary">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent-copper" />
                      Obsidian / Copper (Default)
                    </div>
                  </div>
                </SettingRow>
                <SettingRow title="Font Family" description="Inter UI Sans + JetBrains Mono for code">
                  <span className="text-xs text-text-secondary">Inter 400/500/600</span>
                </SettingRow>
              </div>
            </div>
          )}

          {/* SECTION: NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Notifications</h3>
                <p className="text-xs text-text-tertiary">Control what alerts you receive.</p>
              </div>
              <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-3">
                <SettingRow title="Review Reminders" description="Get notified when concepts are due for review">
                  <Toggle checked={true} onChange={() => {}} />
                </SettingRow>
                <SettingRow title="Contest Alerts" description="Upcoming contest notifications">
                  <Toggle checked={true} onChange={() => {}} />
                </SettingRow>
                <SettingRow title="Deadline Reminders" description="Application and opportunity deadlines">
                  <Toggle checked={true} onChange={() => {}} />
                </SettingRow>
              </div>
            </div>
          )}

          {/* SECTION: DATA */}
          {activeSection === 'data' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Data & Storage</h3>
                <p className="text-xs text-text-tertiary">Manage local persistence.</p>
              </div>
              <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-3">
                <SettingRow title="Local Storage State" description="Current completions, settings, and profile">
                  <button
                    onClick={() => {
                      const data = localStorage.getItem('bholenath_os_store');
                      const blob = new Blob([data || '{}'], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `bholenath-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      soundManager.play('taskCompleted');
                    }}
                    className="text-xs font-semibold text-accent-blue hover:text-blue-400 bg-surface-3 px-3.5 py-1.5 rounded-full border border-border-default transition-colors"
                  >
                    Export JSON Backup
                  </button>
                </SettingRow>
              </div>
            </div>
          )}

          {/* SECTION: ABOUT */}
          {activeSection === 'about' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">About BHOLENATH OS</h3>
                <p className="text-xs text-text-tertiary">Find it. Learn it. Build it. Get ready.</p>
              </div>
              <div className="bg-surface-2 border border-border-default rounded-[10px] p-5">
                <div className="space-y-3 text-xs text-text-secondary">
                  <div className="flex justify-between py-1 border-b border-border-subtle">
                    <span>Version</span>
                    <span className="text-text-primary font-mono">1.0.0 (Slash Vault Edition)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-subtle">
                    <span>Architecture</span>
                    <span className="text-text-primary">Electron 44 + React 19 + TypeScript + Vite 8</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-subtle">
                    <span>Aesthetic</span>
                    <span className="text-accent-copper font-medium">Slash Theme (Obsidian, Onyx, Carbon, Hairline Graphite)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Dedicated for</span>
                    <span className="text-text-primary font-medium">B.Tech CSE Students</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-border-subtle last:border-0">
      <div className="max-w-md">
        <h4 className="text-xs font-semibold text-text-primary">{title}</h4>
        {description && <p className="text-2xs text-text-tertiary mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked = false, onChange }: { checked?: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        soundManager.play('buttonClick');
        onChange(!checked);
      }}
      className={`w-9 h-5 rounded-full transition-colors relative focus-visible:ring-1 focus-visible:ring-bone/30 ${
        checked ? 'bg-accent-copper' : 'bg-surface-4'
      }`}
    >
      <div
        className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all shadow-sm"
        style={{ left: checked ? '19px' : '3px' }}
      />
    </button>
  );
}
