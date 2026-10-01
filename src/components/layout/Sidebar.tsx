import React from 'react';
import {
  Home, Code2, Trophy, BookOpen, Map, Dumbbell, Briefcase,
  GitBranch, BarChart3, MessageCircle, Settings, Zap, ChevronLeft, ChevronRight, Compass
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { PageId } from '../../types';
import ExternalLink from '../common/ExternalLink';
import { GithubIcon } from '../common/Icons';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home size={18} /> },
  { id: 'leetcode', label: 'LeetCode', icon: <Code2 size={18} /> },
  { id: 'opportunities', label: 'Opportunities', icon: <Trophy size={18} /> },
  { id: 'learning', label: 'Learning', icon: <BookOpen size={18} /> },
  { id: 'roadmap', label: 'Roadmap', icon: <Map size={18} /> },
  { id: 'practice', label: 'Practice', icon: <Dumbbell size={18} /> },
  { id: 'compass', label: 'Career Compass', icon: <Compass size={18} /> },
  { id: 'applications', label: 'Applications', icon: <Briefcase size={18} /> },
  { id: 'mistakes', label: 'Mistakes', icon: <Zap size={18} /> },
  { id: 'github', label: 'GitHub', icon: <GitBranch size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
];

const bottomNavItems: NavItem[] = [
  { id: 'bhai', label: 'Bhai', icon: <MessageCircle size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, reviews, userName, githubProfileUrl, leetcodeProfileUrl, setLoginModalOpen } = useAppStore();
  const [collapsed, setCollapsed] = React.useState(false);
  
  const dueReviews = reviews.filter(r => new Date(r.nextReview) <= new Date()).length;

  return (
    <aside
      className={`flex flex-col h-full bg-surface-1 border-r border-border-default transition-all duration-300 ${
        collapsed ? 'w-[60px]' : 'w-[220px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border-subtle shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">B</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-semibold text-text-primary tracking-tight leading-none">BHOLENATH</h1>
            <p className="text-2xs text-text-tertiary tracking-widest">OS</p>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const badge = item.id === 'learning' && dueReviews > 0 ? dueReviews : undefined;
          
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setCurrentPage(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-surface-4 text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent-blue rounded-r" />
              )}
              <span className={`shrink-0 ${isActive ? 'text-accent-blue' : 'text-text-tertiary group-hover:text-text-secondary'}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!collapsed && badge && (
                <span className="ml-auto bg-accent-purple/20 text-accent-purple text-2xs font-semibold px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="py-2 px-2 space-y-0.5 border-t border-border-subtle">
        {bottomNavItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setCurrentPage(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-surface-4 text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
              } ${item.id === 'bhai' && !isActive ? 'text-accent-purple' : ''}`}
            >
              <span className={`shrink-0 ${
                item.id === 'bhai' ? 'text-accent-purple' : 
                isActive ? 'text-accent-blue' : 'text-text-tertiary group-hover:text-text-secondary'
              }`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
        
        {/* User Mini Profile */}
        {!collapsed && (
          <div className="px-2.5 py-2 mt-1 mb-1 rounded-[10px] bg-surface-2 border border-border-subtle flex items-center justify-between">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center gap-2 min-w-0 text-left hover:opacity-80 transition-opacity flex-1"
              title="Click to Connect Accounts or Switch Profile"
            >
              <div className="w-6 h-6 rounded-full bg-surface-4 border border-border-subtle flex items-center justify-center text-text-primary text-2xs font-bold shrink-0">
                {(userName || 'D').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium text-text-primary truncate block leading-none">{userName || 'Developer'}</span>
                <span className="text-2xs text-accent-copper leading-tight">Switch Profile</span>
              </div>
            </button>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              {githubProfileUrl && (
                <ExternalLink
                  href={githubProfileUrl}
                  className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-3"
                  showIcon={false}
                  tooltipText={`GitHub Profile: ${githubProfileUrl}`}
                >
                  <GithubIcon size={13} />
                </ExternalLink>
              )}
              {leetcodeProfileUrl && (
                <ExternalLink
                  href={leetcodeProfileUrl}
                  className="text-text-tertiary hover:text-accent-yellow transition-colors p-1 rounded-md hover:bg-surface-3"
                  showIcon={false}
                  tooltipText={`LeetCode Profile: ${leetcodeProfileUrl}`}
                >
                  <Code2 size={13} />
                </ExternalLink>
              )}
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-[10px] text-text-tertiary hover:text-text-secondary hover:bg-surface-3 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
