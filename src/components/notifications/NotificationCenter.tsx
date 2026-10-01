import React, { useState, useMemo } from 'react';
import {
  Bell, Check, X, Bookmark, ExternalLink as ExternalLinkIcon,
  Clock, Shield, Trophy, Briefcase, BookOpen, Sparkles, Filter,
  ArrowRight, Trash2, CheckCheck
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { NamedNotification, NotificationCategory, PageId } from '../../types';
import ExternalLink from '../common/ExternalLink';
import { soundManager } from '../../utils/soundManager';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  new: <Sparkles size={13} className="text-accent-blue" />,
  deadlines: <Clock size={13} className="text-accent-red" />,
  internships: <Briefcase size={13} className="text-accent-green" />,
  contests: <Trophy size={13} className="text-accent-yellow" />,
  cybersecurity: <Shield size={13} className="text-accent-purple" />,
  learning: <BookOpen size={13} className="text-accent-copper" />,
};

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    notifications,
    markNotificationRead,
    dismissNotification,
    saveNotification,
    setCurrentPage,
    setSelectedOpportunityId,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');

  const filtered = useMemo(() => {
    let list = notifications;
    if (activeTab !== 'all') {
      list = list.filter(n => n.category === activeTab);
    }
    return list;
  }, [notifications, activeTab]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  if (!isOpen) return null;

  const handleAction = (n: NamedNotification, action: 'view' | 'prepare' | 'save' | 'dismiss') => {
    soundManager.play('click');
    if (action === 'dismiss') {
      dismissNotification(n.id);
      return;
    }
    if (action === 'save') {
      saveNotification(n.id);
      return;
    }
    markNotificationRead(n.id);

    if (action === 'prepare') {
      if (n.opportunityId) {
        setSelectedOpportunityId(n.opportunityId);
        setCurrentPage('opportunities');
      } else if (n.actionDestination) {
        setCurrentPage(n.actionDestination.page);
      }
      onClose();
      return;
    }

    if (action === 'view') {
      if (n.url) {
        window.open(n.url, '_blank');
      } else if (n.opportunityId) {
        setSelectedOpportunityId(n.opportunityId);
        setCurrentPage('opportunities');
        onClose();
      } else if (n.actionDestination) {
        setCurrentPage(n.actionDestination.page);
        onClose();
      }
    }
  };

  const handleMarkAllRead = () => {
    soundManager.play('click');
    notifications.forEach(n => markNotificationRead(n.id));
  };

  const tabs: { key: NotificationCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'new', label: 'New' },
    { key: 'deadlines', label: 'Deadlines' },
    { key: 'internships', label: 'Internships' },
    { key: 'contests', label: 'Contests' },
    { key: 'cybersecurity', label: 'Cybersecurity' },
    { key: 'learning', label: 'Learning' },
  ];

  return (
    <div className="absolute top-12 right-4 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-surface-1 border border-border-default rounded-[12px] shadow-2xl overflow-hidden flex flex-col max-h-[580px] animate-scale-up">
      {/* Top Bar */}
      <div className="p-3.5 border-b border-border-default flex items-center justify-between bg-surface-2">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-accent-copper" />
          <h3 className="text-xs font-semibold text-text-primary">Notification Center</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-accent-red/20 text-accent-red text-3xs font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-3xs text-text-tertiary hover:text-text-primary flex items-center gap-1 transition-colors"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary p-1 rounded-md transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-1 p-1.5 border-b border-border-subtle bg-surface-1 overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-2.5 py-1 rounded-full text-2xs font-medium whitespace-nowrap transition-all ${
              activeTab === t.key
                ? 'bg-surface-3 text-text-primary border border-border-subtle font-semibold shadow-xs'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle p-1">
        {filtered.map(n => (
          <div
            key={n.id}
            className={`p-3 rounded-[8px] transition-colors group relative ${
              !n.read ? 'bg-surface-2/70 hover:bg-surface-2' : 'hover:bg-surface-2/40'
            }`}
          >
            {/* Header: Company & Category */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                {categoryIcons[n.category] || <Sparkles size={13} className="text-accent-blue" />}
                <span className="text-3xs uppercase tracking-wider font-bold text-text-secondary">
                  {n.company}
                </span>
                <span className="text-3xs text-text-quaternary">•</span>
                <span className="text-3xs text-accent-copper font-medium">
                  {n.category}
                </span>
              </div>
              <div className="flex items-center gap-1 text-3xs text-text-tertiary font-mono">
                <Clock size={10} />
                <span>{n.deadline}</span>
              </div>
            </div>

            {/* Title */}
            <h4 className="text-xs font-semibold text-text-primary leading-snug mb-1">
              {n.title}
            </h4>

            {/* Why it matches */}
            <p className="text-2xs text-text-secondary leading-relaxed mb-1.5 bg-surface-3/50 rounded p-1.5">
              <strong className="text-text-primary">Match: </strong>{n.matchReason}
            </p>

            {/* Source */}
            <div className="text-3xs text-text-quaternary mb-2.5">
              Source: <span className="text-text-tertiary">{n.source}</span>
            </div>

            {/* Actions: View | Prepare | Save | Dismiss */}
            <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAction(n, 'view')}
                  className="px-2.5 py-1 rounded-full bg-surface-3 text-text-primary hover:bg-surface-4 text-3xs font-medium transition-colors flex items-center gap-1"
                >
                  View
                  <ArrowRight size={10} />
                </button>
                <button
                  onClick={() => handleAction(n, 'prepare')}
                  className="px-2.5 py-1 rounded-full bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/25 text-3xs font-medium transition-colors"
                >
                  Prepare
                </button>
                <button
                  onClick={() => handleAction(n, 'save')}
                  className={`px-2.5 py-1 rounded-full text-3xs font-medium transition-colors flex items-center gap-1 ${
                    n.saved
                      ? 'bg-accent-green/20 text-accent-green'
                      : 'bg-surface-3 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Bookmark size={10} />
                  {n.saved ? 'Saved' : 'Save'}
                </button>
              </div>

              <button
                onClick={() => handleAction(n, 'dismiss')}
                className="text-3xs text-text-quaternary hover:text-accent-red p-1 transition-colors"
                title="Dismiss notification"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-text-tertiary text-xs">
            No notifications in this category.
          </div>
        )}
      </div>
    </div>
  );
}
