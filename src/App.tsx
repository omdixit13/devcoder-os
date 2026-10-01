import React, { useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import CommandPalette from './components/common/CommandPalette';
import ProfileLoginModal from './components/common/ProfileLoginModal';
import InteractiveBackground from './components/common/InteractiveBackground';
import { useAppStore } from './store/useAppStore';

import MobileBottomNav from './components/layout/MobileBottomNav';

// Pages
import HomePage from './pages/Home';
import LeetCodePage from './pages/LeetCode';
import OpportunitiesPage from './pages/Opportunities';
import LearningPage from './pages/Learning';
import RoadmapPage from './pages/Roadmap';
import PracticePage from './pages/Practice';
import ApplicationsPage from './pages/Applications';
import MistakesPage from './pages/Mistakes';
import GitHubPage from './pages/GitHub';
import AnalyticsPage from './pages/Analytics';
import BhaiPage from './pages/Bhai';
import SettingsPage from './pages/Settings';
import CareerCompassPage from './pages/CareerCompass';
import CodingLabPage from './pages/CodingLab';

const pageComponents: Record<string, React.FC> = {
  home: HomePage,
  leetcode: LeetCodePage,
  opportunities: OpportunitiesPage,
  learning: LearningPage,
  roadmap: RoadmapPage,
  practice: PracticePage,
  compass: CareerCompassPage,
  applications: ApplicationsPage,
  mistakes: MistakesPage,
  github: GitHubPage,
  analytics: AnalyticsPage,
  bhai: BhaiPage,
  settings: SettingsPage,
  codinglab: CodingLabPage,
};

export default function App() {
  const { currentPage, leetcodeProfileUrl, fetchLeetCodeStatsAction } = useAppStore();
  const PageComponent = pageComponents[currentPage] || HomePage;

  useEffect(() => {
    if (leetcodeProfileUrl && fetchLeetCodeStatsAction) {
      fetchLeetCodeStatsAction();
    }
  }, [leetcodeProfileUrl, fetchLeetCodeStatsAction]);

  return (
    <div className="h-full min-h-[100dvh] w-full max-w-full min-w-0 flex bg-surface-0/85 backdrop-blur-[1px] text-text-primary overflow-hidden relative">
      {/* Dynamic 3D / Celestial Interactive Atmosphere */}
      <InteractiveBackground />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-hidden bg-transparent pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0">
          <PageComponent />
        </main>
      </div>

      {/* Mobile Bottom Navigation (Phase 22) */}
      <MobileBottomNav />

      {/* Command Palette Overlay */}
      <CommandPalette />

      {/* Developer Profile / Login Modal */}
      <ProfileLoginModal />
    </div>
  );
}
