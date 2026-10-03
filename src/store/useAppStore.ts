import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PageId, BhaiMessage, ApplicationStatus, SkillStatus } from '../types';
import { 
  skillNodes, sampleConcepts, sampleProblems, sampleOpportunities,
  sampleApplications, sampleReviews, sampleContests, sampleDailyStats,
  sampleMistakes, sampleResources
} from '../data/mockData';
import { 
  SkillNode, Concept, Problem, Opportunity, InternshipApplication,
  ReviewItem, LeetCodeContest, DailyStats, Mistake, Resource, NamedNotification,
  SirsSheetProblem, SirsSheetStatus, ExamSession, ExamSubmissionRecord
} from '../types';
import { sirsPracticeSheet } from '../data/sirsSheetData';
import { defaultExamQuestions, generateRandomExamQuestions } from '../data/examQuestionsData';
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
  addSkillNode: (skill: SkillNode) => void;
  removeSkillNode: (id: string) => void;
  updateSkillCustomData: (id: string, data: Partial<SkillNode>) => void;
  
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
  
  // Notifications (Phase 17 & 18)
  notifications: NamedNotification[];
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  saveNotification: (id: string) => void;

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

  // Sir's Practice Sheet
  sirsSheetProblems: SirsSheetProblem[];
  updateSirsSheetStatus: (id: string, status: SirsSheetStatus) => void;
  incrementSirsSheetAttempts: (id: string) => void;

  // 90-Minute Exam Simulator
  activeExamSession: ExamSession | null;
  lastExamQuestionIds: string[];
  startExamSession: () => void;
  setExamActiveQuestion: (index: number) => void;
  updateExamCode: (questionId: string, code: string) => void;
  updateExamCustomInput: (questionId: string, input: string) => void;
  recordExamSubmission: (questionId: string, submission: ExamSubmissionRecord) => void;
  updateExamRemainingSeconds: (seconds: number) => void;
  completeExamSession: () => void;
  resetExamSession: () => void;

  // Tech News Saved
  savedTechNewsIds: string[];
  toggleSaveTechNews: (id: string) => void;
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
      userName: '',
      githubProfileUrl: '',
      leetcodeProfileUrl: '',
      userRole: 'Aspiring Software Engineer',
      userCollege: '',
      isProfileConnected: false,
      loginModalOpen: false,
      setLoginModalOpen: (open) => set({ loginModalOpen: open }),
      connectAccounts: ({ name, github, leetcode, role, college }) => {
        const ghUrl = normalizeProfileUrl(github, 'github');
        const lcUrl = normalizeProfileUrl(leetcode, 'leetcode');
        const cleanName = name?.trim() || 'Developer';
        soundManager.play('milestone');
        triggerConfetti();
        try {
          localStorage.setItem('devcareer_custom_user', 'true');
        } catch {}
        set({
          userName: cleanName,
          githubProfileUrl: ghUrl,
          leetcodeProfileUrl: lcUrl,
          userRole: role?.trim() || 'Software Engineer Candidate',
          userCollege: college?.trim() || '',
          isProfileConnected: true,
          loginModalOpen: false,
        });
        if (lcUrl) {
          get().fetchLeetCodeStatsAction();
        }
      },
      disconnectAccounts: () => {
        soundManager.play('click');
        try {
          localStorage.removeItem('devcareer_custom_user');
        } catch {}
        set({
          userName: '',
          githubProfileUrl: '',
          leetcodeProfileUrl: '',
          userRole: 'Aspiring Software Engineer',
          userCollege: '',
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
      addSkillNode: (skill) => {
        soundManager.play('milestone');
        set(state => ({
          skills: [...state.skills, skill]
        }));
      },
      removeSkillNode: (id) => {
        soundManager.play('click');
        set(state => ({
          skills: state.skills.filter(s => s.id !== id),
          selectedSkillId: state.selectedSkillId === id ? null : state.selectedSkillId,
        }));
      },
      updateSkillCustomData: (id, data) => set(state => ({
        skills: state.skills.map(s => s.id === id ? { ...s, ...data } : s)
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
          content: 'Namaste! Main OM hoon — aapka personal learning companion aur coding coach. DSA, system design, debugging ya career path — bas pooch lijiye. Chaliye, aaj kya solid seekhte hain?',
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
      
      // Notifications (Phase 17 & 18: Named notifications with verified opportunities)
      notifications: [
        {
          id: 'notif-amazon-sde',
          category: 'internships',
          company: 'Amazon',
          title: 'Amazon — Software Development Engineer Internship (2026 Batch) is Open',
          deadline: 'Oct 15, 2026',
          matchReason: 'Matches your profile: DSA (Arrays & Two Pointers) and Python/C++ skills.',
          source: 'Amazon Student Careers • Verified',
          read: false,
          opportunityId: 'opp-1',
          url: 'https://amazon.jobs/en/jobs/2541289',
        },
        {
          id: 'notif-gsoc-2026',
          category: 'new',
          company: 'Google',
          title: 'Google Summer of Code 2026 Contributor Guidance Open',
          deadline: 'Oct 22, 2026',
          matchReason: 'Open-source repo contributions match your public GitHub profile.',
          source: 'Google Open Source Portal • Verified',
          read: false,
          opportunityId: 'opp-2',
          url: 'https://summerofcode.withgoogle.com',
        },
        {
          id: 'notif-lc-contest',
          category: 'contests',
          company: 'LeetCode',
          title: 'LeetCode Weekly Contest 442 Starting This Sunday',
          deadline: 'Oct 04, 2026',
          matchReason: 'Active rating progression for your target 1600+ milestone.',
          source: 'LeetCode Live Contest Calendar • Verified',
          read: false,
          actionDestination: { page: 'codinglab' },
          url: 'https://leetcode.com/contest',
        },
        {
          id: 'notif-tcs-cyber',
          category: 'cybersecurity',
          company: 'TCS Cyber Defense',
          title: 'TCS HackQuest Season 9 — Ethical Hacking & Defense Challenge',
          deadline: 'Oct 28, 2026',
          matchReason: 'Matches the Cybersecurity skill track and system vulnerability roadmap.',
          source: 'TCS NextStep Portal • Verified',
          read: false,
          actionDestination: { page: 'opportunities' },
        },
        {
          id: 'notif-spaced-review',
          category: 'learning',
          company: 'DevCareer OS',
          title: 'Binary Search & Lower Bound Concepts Due for Active Recall',
          deadline: 'Today',
          matchReason: '3 days since last practice — optimal spacing curve for retention.',
          source: 'DevCareer Spaced Repetition Engine',
          read: false,
          actionDestination: { page: 'learning' },
        },
      ],
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      saveNotification: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, saved: !n.saved } : n)
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

      // Sir's Practice Sheet
      sirsSheetProblems: sirsPracticeSheet,
      updateSirsSheetStatus: (id, status) => {
        set(state => ({
          sirsSheetProblems: state.sirsSheetProblems.map(p =>
            p.id === id ? { ...p, status, lastAttempted: new Date().toISOString() } : p
          ),
        }));
        if (status === 'solved') {
          soundManager.play('taskCompleted');
          triggerConfetti();
        }
      },
      incrementSirsSheetAttempts: (id) => {
        set(state => ({
          sirsSheetProblems: state.sirsSheetProblems.map(p =>
            p.id === id ? { ...p, attempts: p.attempts + 1, lastAttempted: new Date().toISOString() } : p
          ),
        }));
      },

      // 90-Minute Exam Simulator (Dynamic Questions Selection)
      activeExamSession: null,
      lastExamQuestionIds: [],
      startExamSession: () => {
        const previousIds = get().activeExamSession?.questions.map(q => q.id) || get().lastExamQuestionIds || [];
        const chosenQuestions = generateRandomExamQuestions(previousIds);
        const initialCodes: Record<string, string> = {};
        const initialInputs: Record<string, string> = {};
        chosenQuestions.forEach(q => {
          initialCodes[q.id] = q.starterCode;
          initialInputs[q.id] = q.examples[0]?.input || '';
        });

        const newSession: ExamSession = {
          id: `exam-${Date.now()}`,
          startedAt: new Date().toISOString(),
          totalSeconds: 5400, // 90 mins
          remainingSeconds: 5400,
          status: 'in_progress',
          activeQuestionIndex: 0,
          questions: chosenQuestions,
          codes: initialCodes,
          customInputs: initialInputs,
          submissions: {},
          debrief: null,
        };

        soundManager.play('milestone');
        set({
          activeExamSession: newSession,
          lastExamQuestionIds: chosenQuestions.map(q => q.id),
        });
      },
      setExamActiveQuestion: (index) => {
        set(state => state.activeExamSession ? ({
          activeExamSession: {
            ...state.activeExamSession,
            activeQuestionIndex: index,
          }
        }) : {});
      },
      updateExamCode: (questionId, code) => {
        set(state => state.activeExamSession ? ({
          activeExamSession: {
            ...state.activeExamSession,
            codes: {
              ...state.activeExamSession.codes,
              [questionId]: code,
            }
          }
        }) : {});
      },
      updateExamCustomInput: (questionId, input) => {
        set(state => state.activeExamSession ? ({
          activeExamSession: {
            ...state.activeExamSession,
            customInputs: {
              ...state.activeExamSession.customInputs,
              [questionId]: input,
            }
          }
        }) : {});
      },
      recordExamSubmission: (questionId, submission) => {
        set(state => {
          if (!state.activeExamSession) return {};
          const updatedSubmissions = {
            ...state.activeExamSession.submissions,
            [questionId]: submission,
          };
          if (submission.status === 'passed' && submission.passedTests === submission.totalTests) {
            soundManager.play('taskCompleted');
          } else {
            soundManager.play('error');
          }
          return {
            activeExamSession: {
              ...state.activeExamSession,
              submissions: updatedSubmissions,
            }
          };
        });
      },
      updateExamRemainingSeconds: (seconds) => {
        set(state => state.activeExamSession ? ({
          activeExamSession: {
            ...state.activeExamSession,
            remainingSeconds: Math.max(0, seconds),
          }
        }) : {});
      },
      completeExamSession: () => {
        const session = get().activeExamSession;
        if (!session) return;
        
        let attemptedCount = 0;
        let solvedCount = 0;
        let runtimeErrors = 0;
        let compilationErrors = 0;
        let wrongAnswers = 0;
        const weakConceptsSet = new Set<string>();

        const breakdown = session.questions.map(q => {
          const sub = session.submissions[q.id];
          const hasAttempted = !!sub || session.codes[q.id] !== q.starterCode;
          if (hasAttempted) attemptedCount++;

          const isSolved = sub?.status === 'passed' && sub.passedTests === sub.totalTests;
          if (isSolved) {
            solvedCount++;
          } else {
            q.hiddenConcepts.forEach(c => weakConceptsSet.add(c));
          }

          if (sub) {
            if (sub.status === 'runtime_error') runtimeErrors++;
            else if (sub.status === 'wrong_answer') wrongAnswers++;
            if (sub.error && (sub.error.includes('SyntaxError') || sub.error.includes('IndentationError'))) {
              compilationErrors++;
            }
          }

          return {
            questionTitle: q.title,
            concepts: q.hiddenConcepts,
            debriefText: q.debriefExplanation,
            isSolved: !!isSolved,
          };
        });

        const weakConcepts = Array.from(weakConceptsSet);
        const recommendations: string[] = [];
        if (weakConcepts.length === 0) {
          recommendations.push('Outstanding performance! All 3 mock problems solved within time.');
          recommendations.push('Maintain muscle memory with daily 20-min timed practice drills.');
        } else {
          recommendations.push(`Revise ${weakConcepts.slice(0, 2).join(' & ')} pattern recognition with OM.`);
          recommendations.push('Check Sir\'s Practice Sheet variations for the concepts you missed.');
          recommendations.push('Review the hidden concept breakdown below to train pattern detection.');
        }

        const debrief = {
          attemptedCount,
          solvedCount,
          timeSpentSeconds: session.totalSeconds - session.remainingSeconds,
          compilationErrors,
          runtimeErrors,
          wrongAnswers,
          weakConcepts,
          conceptBreakdown: breakdown,
          recommendations,
        };

        if (solvedCount > 0) {
          soundManager.play('milestone');
          triggerConfetti();
        } else {
          soundManager.play('taskCompleted');
        }

        set({
          activeExamSession: {
            ...session,
            status: 'completed',
            debrief,
          }
        });
      },
      resetExamSession: () => {
        const prevIds = get().activeExamSession?.questions.map(q => q.id) || [];
        set({
          activeExamSession: null,
          lastExamQuestionIds: prevIds.length > 0 ? prevIds : get().lastExamQuestionIds,
        });
      },

      // Tech News Saved
      savedTechNewsIds: [],
      toggleSaveTechNews: (id) => {
        set(state => {
          const exists = state.savedTechNewsIds.includes(id);
          soundManager.play('click');
          return {
            savedTechNewsIds: exists
              ? state.savedTechNewsIds.filter(i => i !== id)
              : [...state.savedTechNewsIds, id],
          };
        });
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
        sirsSheetProblems: state.sirsSheetProblems,
        activeExamSession: state.activeExamSession,
        lastExamQuestionIds: state.lastExamQuestionIds,
        savedTechNewsIds: state.savedTechNewsIds,
      }),
      version: 4,
      migrate: (persistedState: any) => {
        if (!persistedState) return {};
        // If the stored profile was the hardcoded legacy test account, reset it so new user can sign up
        const isCustomUser = typeof window !== 'undefined' && localStorage.getItem('devcareer_custom_user') === 'true';
        if (!isCustomUser && (persistedState.userName === 'Om Dixit' || persistedState.userName === 'Om')) {
          persistedState.userName = '';
          persistedState.githubProfileUrl = '';
          persistedState.leetcodeProfileUrl = '';
          persistedState.isProfileConnected = false;
        }
        return persistedState;
      },
    }
  )
);
