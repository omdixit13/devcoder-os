import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Home, Code2, Trophy, BookOpen, Map, Dumbbell,
  Briefcase, BarChart3, MessageCircle, Settings,
  Play, Zap, Calendar, FileText, X, Compass
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { useAppStore } from '../../store/useAppStore';
import type { PageId } from '../../types';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  shortcut?: string;
}

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setCurrentPage, setBhaiTeachingConcept } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = useMemo(() => [
    { id: 'home', label: 'Go to Home', icon: <Home size={16} />, action: () => setCurrentPage('home'), category: 'Navigation' },
    { id: 'leetcode', label: 'Open LeetCode', icon: <Code2 size={16} />, action: () => setCurrentPage('leetcode'), category: 'Navigation' },
    { id: 'github', label: 'Open GitHub', icon: <GithubIcon size={16} />, action: () => setCurrentPage('github'), category: 'Navigation' },
    { id: 'start-session', label: 'Start today\'s session', description: 'Begin focused 60-min session', icon: <Play size={16} />, action: () => setCurrentPage('learning'), category: 'Actions' },
    { id: 'contests', label: 'Find contests', description: 'Upcoming coding contests in IST', icon: <Calendar size={16} />, action: () => setCurrentPage('leetcode'), category: 'Actions' },
    { id: 'hackathons', label: 'Find hackathons', icon: <Trophy size={16} />, action: () => setCurrentPage('opportunities'), category: 'Actions' },
    { id: 'internships', label: 'Find internships', icon: <Briefcase size={16} />, action: () => setCurrentPage('opportunities'), category: 'Actions' },
    { id: 'review', label: 'Review concepts', description: 'Spaced repetition review', icon: <Zap size={16} />, action: () => setCurrentPage('learning'), category: 'Actions' },
    { id: 'open-roadmap', label: 'Open roadmap', description: 'Visual skill map & progression', icon: <Map size={16} />, action: () => setCurrentPage('roadmap'), category: 'Navigation' },
    { id: 'sirs-sheet', label: "Sir's Practice Sheet", description: '29 exact syllabus problems', icon: <FileText size={16} />, action: () => setCurrentPage('sirsheet'), category: 'Navigation', shortcut: 'S' },
    { id: 'exam-simulator', label: '90-Min Exam Simulator', description: 'Timed mock without hints', icon: <Play size={16} />, action: () => setCurrentPage('examsimulator'), category: 'Actions', shortcut: 'E' },
    { id: 'tech-news', label: 'Tech News', description: 'Verified developer releases & intelligence', icon: <FileText size={16} />, action: () => setCurrentPage('technews'), category: 'Navigation' },
    { id: 'cybersecurity', label: 'Cybersecurity', description: 'Authorized labs & defense modules', icon: <Trophy size={16} />, action: () => setCurrentPage('cybersecurity'), category: 'Navigation' },
    { id: 'ask-om', label: 'Ask OM', description: 'Open AI senior mentor chat', icon: <MessageCircle size={16} />, action: () => setCurrentPage('om'), category: 'Actions', shortcut: 'O' },
    { id: 'compass', label: 'Open Career Compass', description: 'Discover your technical interest signals', icon: <Compass size={16} />, action: () => setCurrentPage('compass'), category: 'Navigation', shortcut: 'C' },
    { id: 'practice', label: 'Practice Problems', icon: <Dumbbell size={16} />, action: () => setCurrentPage('practice'), category: 'Navigation' },
    { id: 'applications', label: 'My Applications', icon: <Briefcase size={16} />, action: () => setCurrentPage('applications'), category: 'Navigation' },
    { id: 'analytics', label: 'View Analytics', icon: <BarChart3 size={16} />, action: () => setCurrentPage('analytics'), category: 'Navigation' },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} />, action: () => setCurrentPage('settings'), category: 'Navigation' },
    { id: 'mistakes', label: 'Mistake Notebook', icon: <FileText size={16} />, action: () => setCurrentPage('mistakes'), category: 'Actions' },
    { id: 'teach-bs', label: 'OM, teach me Binary Search', icon: <MessageCircle size={16} />, action: () => { setBhaiTeachingConcept('bs-intro'); setCurrentPage('om'); }, category: 'Learn' },
  ], [setCurrentPage, setBhaiTeachingConcept]);

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      c => c.label.toLowerCase().includes(q) || 
           c.category.toLowerCase().includes(q) ||
           (c.description?.toLowerCase().includes(q))
    );
  }, [query, commands]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filtered]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      setCommandPaletteOpen(false);
    }
  };

  if (!commandPaletteOpen) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setCommandPaletteOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      
      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-surface-2 border border-border-default rounded-xl shadow-modal animate-scale-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <Search size={16} className="text-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          />
          <button onClick={() => setCommandPaletteOpen(false)} className="text-text-tertiary hover:text-text-secondary">
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-text-tertiary text-sm">
              No commands found for "{query}"
            </div>
          )}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="px-4 py-1.5">
                <span className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider">{category}</span>
              </div>
              {items.map((item) => {
                flatIndex++;
                const isSelected = flatIndex === selectedIndex;
                const currentIndex = flatIndex;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                      isSelected ? 'bg-surface-4 text-text-primary' : 'text-text-secondary hover:bg-surface-3'
                    }`}
                    onClick={() => {
                      item.action();
                      setCommandPaletteOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                  >
                    <span className={isSelected ? 'text-accent-blue' : 'text-text-tertiary'}>{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.label}</div>
                      {item.description && (
                        <div className="text-2xs text-text-tertiary truncate">{item.description}</div>
                      )}
                    </div>
                    {item.shortcut && (
                      <kbd className="bg-surface-2 border border-border-subtle rounded px-1.5 py-0.5 text-2xs text-text-tertiary font-mono">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border-subtle text-2xs text-text-tertiary">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
