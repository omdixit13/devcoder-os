import React from 'react';
import { Home, BookOpen, Terminal, Trophy, Compass } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { PageId } from '../../types';
import { soundManager } from '../../utils/soundManager';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
}

const mobileItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home size={18} /> },
  { id: 'learning', label: 'Learn', icon: <BookOpen size={18} /> },
  { id: 'codinglab', label: 'Code', icon: <Terminal size={18} /> },
  { id: 'opportunities', label: 'Opportunities', icon: <Trophy size={18} /> },
  { id: 'compass', label: 'Career', icon: <Compass size={18} /> },
];

export default function MobileBottomNav() {
  const { currentPage, setCurrentPage } = useAppStore();

  const handleNav = (page: PageId) => {
    soundManager.play('navigation');
    setCurrentPage(page);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface-1 border-t border-border-default flex items-center justify-around px-2 z-40">
      {mobileItems.map((item) => {
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              isActive ? 'text-accent-copper font-semibold scale-105' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {item.icon}
            <span className="text-3xs mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
