import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PageId, BhaiMessage, ApplicationStatus, SkillStatus } from '../types';
import { 
  skillNodes, sampleConcepts, sampleProblems, sampleOpportunities,
  sampleApplications, sampleReviews, sampleContests, sampleDailyStats,
  sampleMistakes, sampleResources
} from '../data/mockData';
import type { 
  SkillNode, Concept, Problem, Opportunity, InternshipApplication,
  ReviewItem, LeetCodeContest, DailyStats, Mistake, Resource
} from '../types';
import { soundManager } from '../utils/soundManager';
import { triggerConfetti } from '../utils/confetti';
import { normalizeProfileUrl } from '../utils/urlValidator';
import { fetchUserLeetCodeStats, type LeetCodeStats } from '../utils/leetcodeService';

interface AppState {
  // Navigation
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  
  // Command Palette
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // User Profile & Authentication
  userName: string;
  githubProfileUrl: string;
  leetcodeProfileUrl: string;
  userRole: string;
  userCollege: string;
  isProfileConnected: boolean;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  connectAccounts: (data: {
    name: string;
    github: string;
    leetcode: string;
    role?: string;
    college?: string;
  }) => void;
  disconnectAccounts: () => void;
  updateUserProfile: (profile: Partial<{
    userName: string;
    githubProfileUrl: string;
    leetcodeProfileUrl: string;
    userRole: string;
    userCollege: string;
    isProfileConnected: boolean;
  }>) => void;

  // Live LeetCode Stats
  leetcodeStats: LeetCodeStats | null;
  isFetchingLeetCodeStats: boolean;
  fetchLeetCodeStatsAction: () => Promise<void>;

  // Sound & Motion Settings
  soundEnabled: boolean;
  soundVolume: number; // 0 - 100
  reducedMotion: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setReducedMotion: (reduced: boolean) => void;

  // Skills & Roadmap
  skills: SkillNode[];
  selectedSkillId: string | null;
  setSelectedSkillId: (id: string | null) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  updateSkillStatus: (id: string, status: SkillStatus) => void;
  
  // Concepts
  concepts: Concept[];
  selectedConceptId: string | null;
  setSelectedConceptId: (id: string | null) => void;
  completeConcept: (conceptId: string) => {
    success: boolean;
    conceptName: string;
    skillName: string;
    nextProblem?: Problem;
    suggestedActionText: string;
  };
  
  // Problems
  problems: Problem[];
  updateProblemStatus: (id: string, status: Problem['status']) => void;
  
  // Opportunities
  opportunities: Opportunity[];
  selectedOpportunityId: string | null;
  setSelectedOpportunityId: (id: string | null) => void;
  opportunityFilter: string;
  setOpportunityFilter: (filter: string) => void;
  
  // Applications
  applications: InternshipApplication[];
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  addApplication: (app: InternshipApplication) => void;
  
  // Reviews
  reviews: ReviewItem[];
  completeReview: (id: string) => void;
  
  // Contests
  contests: LeetCodeContest[];
  
  // Daily Stats
  dailyStats: DailyStats;
  
  // Mistakes
  mistakes: Mistake[];
  addMistake: (mistake: Mistake) => void;
  
  // Resources
  resources: Resource[];
  
  // Bhai Chat
  bhaiMessages: BhaiMessage[];
  addBhaiMessage: (msg: BhaiMessage) => void;
  bhaiTeachingConcept: string | null;
  setBhaiTeachingConcept: (conceptId: string | null) => void;
  
  // Learning Session
  activeSession: { conceptId: string; startTime: string; type: string } | null;
  startSession: (conceptId: string, type: string) => void;
  endSession: () => void;
  
  // Notifications
  notifications: { id: string; text: string; type: string; read: boolean }[];
  markNotificationRead: (id: string) => void;

  // GitHub Solution Sync (Section 14)
  syncedSolutions: {
    id: string;
    problem: string;
    difficulty: string;
    topic: string;
    language: string;
    date: string;
    code: string;
    repository: string;
    url: string;
  }[];
  addSyncedSolution: (solution: {
    problem: string;
    difficulty: string;
    topic: string;
    language: string;
    code: string;
    repository: string;
    url: string;
  }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentPage: 'home',
      setCurrentPage: (page) => {
        soundManager.play('navigation');
        set({ currentPage: page });
      },
      
      // Command Palette
      commandPaletteOpen: false,
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      
      // User Profile & Authentication
      userName: 'Om Dixit',
      githubProfileUrl: 'https://github.com/omdixit13',
      leetcodeProfileUrl: 'https://leetcode.com/u/omdixit13',
      userRole: 'B.Tech CSE Student',
      userCollege: 'Computer Science & Engineering',
      isProfileConnected: true,
      loginModalOpen: false,
      setLoginModalOpen: (open) => set({ loginModalOpen: open }),
      connectAccounts: ({ name, github, leetcode, role, college }) => {
        const ghUrl = normalizeProfileUrl(github, 'github');
        const lcUrl = normalizeProfileUrl(leetcode, 'leetcode');
        const cleanName = name?.trim() || 'Developer';
        soundManager.play('milestone');
        triggerConfetti();
        set({
          userName: cleanName,
          githubProfileUrl: ghUrl,
          leetcodeProfileUrl: lcUrl,
          userRole: role?.trim() || 'B.Tech CSE Student',
          userCollege: college?.trim() || 'Computer Science & Engineering',
          isProfileConnected: true,
          loginModalOpen: false,
        });
        if (lcUrl) {
          get().fetchLeetCodeStatsAction();
        }
      },
      disconnectAccounts: () => {
        soundManager.play('click');
        set({
          userName: 'Developer',
          githubProfileUrl: '',
          leetcodeProfileUrl: '',
          userRole: 'Developer Candidate',
          userCollege: 'Self-Taught / College',
          isProfileConnected: false,
          leetcodeStats: null,
        });
      },
      updateUserProfile: (profile) => set((state) => ({ ...state, ...profile })),

      // Live LeetCode Stats
      leetcodeStats: null,
      isFetchingLeetCodeStats: false,
      fetchLeetCodeStatsAction: async () => {
        const url = get().leetcodeProfileUrl;
        if (!url) return;
        set({ isFetchingLeetCodeStats: true });
        try {
          const stats = await fetchUserLeetCodeStats(url);
          if (stats) {
            set({ leetcodeStats: stats, isFetchingLeetCodeStats: false });
          } else {
            set({ isFetchingLeetCodeStats: false });
          }
        } catch (err) {
          console.warn('Failed to fetch LeetCode stats:', err);
          set({ isFetchingLeetCodeStats: false });
        }
      },

      // Sound & Motion Settings
      soundEnabled: true,
      soundVolume: 35,
      reducedMotion: false,
      setSoundEnabled: (enabled) => {
        soundManager.setEnabled(enabled);
        set({ soundEnabled: enabled });
      },
      setSoundVolume: (volume) => {
        soundManager.setVolume(volume);
        set({ soundVolume: volume });
      },
      setReducedMotion: (reduced) => {
        try {
          localStorage.setItem('bholenath_reduced_motion', String(reduced));
        } catch {
          // ignore
        }
        set({ reducedMotion: reduced });
      },
      
      // Skills
      skills: skillNodes,
      selectedSkillId: null,
      setSelectedSkillId: (id) => set({ selectedSkillId: id }),
      selectedCategory: 'DSA',
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      updateSkillStatus: (id, status) => set((state) => ({
        skills: state.skills.map(s => s.id === id ? { ...s, status } : s)
      })),
      
      // Concepts
      concepts: sampleConcepts,
      selectedConceptId: null,
      setSelectedConceptId: (id) => set({ selectedConceptId: id }),
      
      // Complete Concept Action with Full Experience
      completeConcept: (conceptId: string) => {
        const state = get();
        const concept = state.concepts.find(c => c.id === conceptId);
        if (!concept) {
          return {
            success: false,
            conceptName: '',
            skillName: '',
            suggestedActionText: '',
          };
        }

        const now = new Date();
        const nextReviewDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

        // 1. Update Concept status
        const updatedConcepts = state.concepts.map(c => 
          c.id === conceptId
            ? {
                ...c,
                status: 'mastered' as SkillStatus,
                lastReviewed: now.toISOString().split('T')[0],
                nextReview: nextReviewDate,
                reviewCount: c.reviewCount + 1,
              }
            : c
        );

        // 2. Update Skill Progress
        const parentSkill = state.skills.find(s => s.id === concept.skillId);
        let skillName = parentSkill?.name || 'DSA';
        let updatedSkills = state.skills;

        if (parentSkill) {
          const siblingConcepts = updatedConcepts.filter(c => c.skillId === parentSkill.id);
          const completedCount = siblingConcepts.filter(c => c.status === 'mastered').length;
          const isAllCompleted = completedCount >= parentSkill.conceptCount;

          updatedSkills = state.skills.map(s => 
            s.id === parentSkill.id
              ? {
                  ...s,
                  completedConcepts: completedCount,
                  status: isAllCompleted ? ('mastered' as SkillStatus) : ('comfortable' as SkillStatus),
                }
              : s
          );
        }

        // 3. Schedule spaced review
        const existingReview = state.reviews.find(r => r.conceptId === conceptId);
        let updatedReviews = state.reviews;
        if (existingReview) {
          updatedReviews = state.reviews.map(r => 
            r.conceptId === conceptId
              ? {
                  ...r,
                  reviewCount: r.reviewCount + 1,
                  nextReview: nextReviewDate,
                }
              : r
          );
        } else {
          updatedReviews = [
            ...state.reviews,
            {
              id: `rev-${Date.now()}`,
              conceptId: concept.id,
              conceptName: concept.name,
              nextReview: nextReviewDate,
              interval: 3,
              ease: 2.5,
              reviewCount: 1,
            },
          ];
        }

        // 4. Update Daily Stats (increment learning minutes & sessions)
        const updatedDailyStats = {
          ...state.dailyStats,
          learningMinutes: state.dailyStats.learningMinutes + 20,
        };

        // 5. Find ONE next action (unsolved practice problem matching this concept/topic)
        const nextProblem = state.problems.find(p => 
          (p.conceptId === conceptId || p.topic.some(t => concept.skillId.includes(t))) &&
          p.status !== 'solved'
        ) || state.problems.find(p => p.status !== 'solved');

        // Apply state updates
        set({
          concepts: updatedConcepts,
          skills: updatedSkills,
          reviews: updatedReviews,
          dailyStats: updatedDailyStats,
        });

        // 6. Play satisfying concept completed sound
        soundManager.play('conceptCompleted');

        // 7. Trigger elegant, subtle confetti
        triggerConfetti();

        return {
          success: true,
          conceptName: concept.name,
          skillName,
          nextProblem,
          suggestedActionText: nextProblem
            ? `Nice! Ab next step: solve "${nextProblem.title}" without looking at the notes.`
            : `Awesome job! You've solidified ${concept.name}. Revise your notes or pick another topic.`,
        };
      },
      
      // Problems
      problems: sampleProblems,
      updateProblemStatus: (id, status) => {
        if (status === 'solved') {
          soundManager.play('taskCompleted');
        }
        set((state) => ({
          problems: state.problems.map(p => p.id === id ? { ...p, status } : p),
          dailyStats: {
            ...state.dailyStats,
            problemsSolved: status === 'solved' 
              ? state.dailyStats.problemsSolved + 1 
              : state.dailyStats.problemsSolved,
          }
        }));
      },
      
      // Opportunities
      opportunities: sampleOpportunities,
      selectedOpportunityId: null,
      setSelectedOpportunityId: (id) => set({ selectedOpportunityId: id }),
      opportunityFilter: 'all',
      setOpportunityFilter: (filter) => set({ opportunityFilter: filter }),
      
      // Applications
      applications: sampleApplications,
      updateApplicationStatus: (id, status) => set((state) => ({
        applications: state.applications.map(a => a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a)
      })),
      addApplication: (app) => {
        soundManager.play('taskCompleted');
        set((state) => ({
          applications: [...state.applications, app]
        }));
      },
      
      // Reviews
      reviews: sampleReviews,
      completeReview: (id) => {
        soundManager.play('taskCompleted');
        set((state) => ({
          reviews: state.reviews.map(r => r.id === id ? {
            ...r,
            reviewCount: r.reviewCount + 1,
            nextReview: new Date(Date.now() + r.interval * 2 * 86400000).toISOString().split('T')[0],
            interval: Math.round(r.interval * r.ease),
          } : r)
        }));
      },
      
      // Contests
      contests: sampleContests,
      
      // Daily Stats
      dailyStats: sampleDailyStats,
      
      // Mistakes
      mistakes: sampleMistakes,
      addMistake: (mistake) => {
        soundManager.play('taskCompleted');
        set((state) => ({
          mistakes: [...state.mistakes, mistake]
        }));
      },
      
      // Resources
      resources: sampleResources,
      
      // Bhai Chat
      bhaiMessages: [
        {
          id: 'welcome',
          role: 'bhai',
          content: 'Namaste Om! Main Bhai hoon — aapka personal learning companion. Kuch bhi seekhna ho, kisi bhi concept mein help chahiye, ya career guidance — bas pooch lijiye. Chaliye, aaj kya karte hain?',
          timestamp: new Date().toISOString(),
          type: 'text',
        }
      ],
      addBhaiMessage: (msg) => set((state) => ({
        bhaiMessages: [...state.bhaiMessages, msg]
      })),
      bhaiTeachingConcept: null,
      setBhaiTeachingConcept: (conceptId) => set({ bhaiTeachingConcept: conceptId }),
      
      // Learning Session
      activeSession: null,
      startSession: (conceptId, type) => set({
        activeSession: { conceptId, startTime: new Date().toISOString(), type }
      }),
      endSession: () => set({ activeSession: null }),
      
      // Notifications
      notifications: [
        { id: 'n1', text: 'Binary Search Basics review due today', type: 'review', read: false },
        { id: 'n2', text: 'Codeforces Round #900 starts in 2 days', type: 'contest', read: false },
        { id: 'n3', text: 'Amazon ML Challenge deadline in 4 days', type: 'opportunity', read: false },
      ],
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),

      // GitHub Solution Sync (Section 14)
      syncedSolutions: [
        {
          id: 'sol-1',
          problem: 'Binary Search',
          difficulty: 'Beginner',
          topic: 'Binary Search',
          language: 'C++',
          date: '2026-09-30',
          code: `int search(vector<int>& nums, int target) {\n    int low = 0, high = nums.size() - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
          repository: 'dsa-solutions',
          url: 'https://leetcode.com/problems/binary-search/'
        }
      ],
      addSyncedSolution: (solution) => {
        soundManager.play('milestone');
        triggerConfetti();
        const newSol = {
          ...solution,
          id: `sol-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
        };
        set(state => ({
          syncedSolutions: [newSol, ...state.syncedSolutions]
        }));
      },
    }),
    {
      name: 'bholenath_os_store',
      // Persist user completions, profile, settings, and apps across restarts
      partialize: (state) => ({
        userName: state.userName,
        githubProfileUrl: state.githubProfileUrl,
        leetcodeProfileUrl: state.leetcodeProfileUrl,
        userRole: state.userRole,
        userCollege: state.userCollege,
        isProfileConnected: state.isProfileConnected,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        reducedMotion: state.reducedMotion,
        concepts: state.concepts,
        skills: state.skills,
        problems: state.problems,
        applications: state.applications,
        reviews: state.reviews,
        mistakes: state.mistakes,
        dailyStats: state.dailyStats,
        syncedSolutions: state.syncedSolutions,
        leetcodeStats: state.leetcodeStats,
      }),
      version: 3,
      migrate: (persistedState: any) => {
        if (!persistedState) return {};
        if (!persistedState.githubProfileUrl || persistedState.githubProfileUrl.includes('om-dev')) {
          persistedState.githubProfileUrl = 'https://github.com/omdixit13';
        }
        if (!persistedState.leetcodeProfileUrl || persistedState.leetcodeProfileUrl.includes('om-dev')) {
          persistedState.leetcodeProfileUrl = 'https://leetcode.com/u/omdixit13';
        }
        if (!persistedState.userName || persistedState.userName === 'Om' || persistedState.userName === 'Developer') {
          persistedState.userName = 'Om Dixit';
        }
        persistedState.isProfileConnected = true;
        return persistedState;
      },
    }
  )
);
