import React, { useState } from 'react';
import { Search, Command, Bell, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import NotificationCenter from '../notifications/NotificationCenter';
import { soundManager } from '../../utils/soundManager';

export default function TopBar() {
  const { toggleCommandPalette, notifications, currentPage, userName, isProfileConnected, setLoginModalOpen } = useAppStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const pageTitle: Record<string, string> = {
    home: 'Home',
    leetcode: 'LeetCode',
    opportunities: 'Opportunities',
    learning: 'Learning',
    roadmap: 'Skill Roadmap',
    practice: 'Practice',
    compass: 'Career Compass',
    codinglab: 'Coding Lab',
    sirsheet: "Sir's Practice Sheet",
    examsimulator: '90-Min Exam Simulator',
    technews: 'Tech News',
    cybersecurity: 'Cybersecurity',
    applications: 'Applications',
    mistakes: 'Mistake Notebook',
    github: 'GitHub',
    analytics: 'Analytics',
    om: 'OM — Senior Mentor',
    bhai: 'OM — Senior Mentor',
    settings: 'Settings',
  };

  return (
    <header className="min-h-12 pt-[env(safe-area-inset-top)] bg-surface-1 border-b border-border-default flex items-center justify-between px-3 sm:px-4 shrink-0 relative max-w-full min-w-0 gap-2">
      {/* Left: Page Title */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <h2 className="text-xs sm:text-sm font-medium text-text-secondary truncate max-w-[110px] sm:max-w-none">
          {pageTitle[currentPage] || 'DEVCAREER OS'}
        </h2>
      </div>

      {/* Center: Search / Command Palette */}
      <button
        onClick={toggleCommandPalette}
        id="global-search"
        className="flex items-center gap-2 bg-surface-3 hover:bg-surface-4 border border-border-subtle rounded-lg px-2.5 sm:px-3 py-1.5 transition-colors flex-1 max-w-[280px] min-w-0 group"
      >
        <Search size={14} className="text-text-tertiary shrink-0" />
        <span className="text-xs sm:text-sm text-text-tertiary group-hover:text-text-secondary truncate">
          Search...
        </span>
        <div className="ml-auto hidden sm:flex items-center gap-1 bg-surface-2 rounded px-1.5 py-0.5 border border-border-subtle shrink-0">
          <Command size={10} className="text-text-tertiary" />
          <span className="text-2xs text-text-tertiary font-medium">K</span>
        </div>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Notifications */}
        <button
          id="notifications-btn"
          onClick={() => {
            soundManager.play('click');
            setNotifOpen(!notifOpen);
          }}
          className={`relative p-2 rounded-lg transition-colors ${
            notifOpen ? 'bg-surface-4 text-text-primary' : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-3'
          }`}
          title="Notification Center"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full animate-pulse-subtle" />
          )}
        </button>

        {/* Notification Center Popover */}
        <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

        {/* Profile / Sign Up */}
        <button
          onClick={() => setLoginModalOpen(true)}
          id="profile-btn"
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-surface-3/80 hover:bg-surface-4 border border-border-default transition-all text-xs"
          title={isProfileConnected ? 'Developer Profile' : 'Sign Up / Login'}
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent-copper/20 text-accent-copper border border-accent-copper/30 flex items-center justify-center text-2xs sm:text-xs font-bold shrink-0">
            {isProfileConnected && userName ? userName.slice(0, 1).toUpperCase() : <User size={12} />}
          </div>
          <span className="text-xs text-text-primary font-medium">
            {isProfileConnected && userName ? userName : 'Sign Up'}
          </span>
          {isProfileConnected ? (
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green" title="Profile Connected" />
          ) : (
            <span className="text-2xs text-accent-copper font-medium hidden sm:inline">New</span>
          )}
        </button>
      </div>
    </header>
  );
}
