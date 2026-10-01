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
    applications: 'Applications',
    mistakes: 'Mistake Notebook',
    github: 'GitHub',
    analytics: 'Analytics',
    bhai: 'Bhai — AI Tutor',
    settings: 'Settings',
  };

  return (
    <header className="h-12 bg-surface-1 border-b border-border-default flex items-center justify-between px-4 shrink-0 relative">
      {/* Left: Page Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-text-secondary">{pageTitle[currentPage] || 'DEVCAREER OS'}</h2>
      </div>

      {/* Center: Search / Command Palette */}
      <button
        onClick={toggleCommandPalette}
        id="global-search"
        className="flex items-center gap-2 bg-surface-3 hover:bg-surface-4 border border-border-subtle rounded-lg px-3 py-1.5 transition-colors min-w-[280px] group"
      >
        <Search size={14} className="text-text-tertiary" />
        <span className="text-sm text-text-tertiary group-hover:text-text-secondary">Search or command...</span>
        <div className="ml-auto flex items-center gap-1 bg-surface-2 rounded px-1.5 py-0.5 border border-border-subtle">
          <Command size={10} className="text-text-tertiary" />
          <span className="text-2xs text-text-tertiary font-medium">K</span>
        </div>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 relative">
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

        {/* Profile */}
        <button
          onClick={() => setLoginModalOpen(true)}
          id="profile-btn"
          className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-surface-3 border border-transparent hover:border-border-subtle transition-colors"
          title="Developer Profile & Login"
        >
          <div className="w-6 h-6 rounded-full bg-surface-4 border border-border-subtle flex items-center justify-center text-text-primary text-xs font-bold">
            {(userName || 'D').slice(0, 1).toUpperCase()}
          </div>
          <span className="text-xs text-text-secondary font-medium hidden sm:inline">
            {userName || 'Connect'}
          </span>
          {isProfileConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green" title="Accounts Linked" />
          )}
        </button>
      </div>
    </header>
  );
}
