// ===== Core Types for BHOLENATH OS =====

// --- Navigation ---
export type PageId = 
  | 'home' | 'leetcode' | 'opportunities' | 'learning' 
  | 'roadmap' | 'practice' | 'compass' | 'applications' | 'github' 
  | 'analytics' | 'bhai' | 'settings' | 'mistakes' | 'codinglab';

// --- Skill & Learning ---
export type SkillStatus = 'not_started' | 'learning' | 'needs_revision' | 'comfortable' | 'mastered';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface SkillNode {
  id: string;
  name: string;
  category: string;
  status: SkillStatus;
  children: string[];
  prerequisites: string[];
  description: string;
  conceptCount: number;
  completedConcepts: number;
  priority?: 'High' | 'Medium' | 'Low';
  deadline?: string;
  notes?: string;
  isCustom?: boolean;
}

export interface Concept {
  id: string;
  skillId: string;
  name: string;
  description: string;
  theIdea: string;
  theIntuition: string;
  howItWorks: string;
  example: string;
  commonMistake: string;
  whenToUse: string;
  interviewRelevance: string;
  status: SkillStatus;
  lastReviewed: string | null;
  nextReview: string | null;
  reviewCount: number;
}

// --- Practice ---
export interface Problem {
  id: string;
  title: string;
  platform: string;
  difficulty: Difficulty;
  topic: string[];
  url: string;
  status: 'unsolved' | 'attempted' | 'solved';
  conceptId: string;
  hintsUsed: number;
}

export interface Mistake {
  id: string;
  problemId: string;
  concept: string;
  whatITried: string;
  whatWentWrong: string;
  correctIdea: string;
  howToAvoid: string;
  reviewDate: string;
  createdAt: string;
  tags: string[];
}

// --- Opportunities ---
export type OpportunityType = 'contest' | 'hackathon' | 'ml_competition' | 'internship' | 'program' | 'challenge';

export interface OpportunityPrepConcept {
  id: string;
  name: string;
  category: string;
  notes: string;
  importance: 'essential' | 'high' | 'good_to_know';
  bhaiPrompt?: string;
}

export interface OpportunityPrepResource {
  title: string;
  url: string;
  type: 'video' | 'documentation' | 'guide';
  source: string;
  duration: string;
}

export interface OpportunityPrepProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  platform: string;
  url: string;
  topic: string;
}

export interface OpportunityPrepPhase {
  phase: string;
  timeframe: string;
  goals: string[];
}

export interface OpportunityPrepPlan {
  rounds: { name: string; type: string; description: string; duration?: string }[];
  keyConcepts: OpportunityPrepConcept[];
  resources: OpportunityPrepResource[];
  practiceProblems: OpportunityPrepProblem[];
  roadmapPhases: OpportunityPrepPhase[];
}

export interface Opportunity {
  id: string;
  title: string;
  organizer: string;
  type: OpportunityType;
  description: string;
  startDate: string;
  endDate: string;
  deadline: string;
  skills: string[];
  url: string;
  source: string;
  sourceUrl: string;
  lastVerified: string;
  location: string;
  mode: 'online' | 'offline' | 'hybrid';
  eligibility: string;
  prize: string;
  prepPlan?: OpportunityPrepPlan;
}

// --- Internship ---
export type ApplicationStatus = 'saved' | 'preparing' | 'applied' | 'assessment' | 'interview' | 'completed' | 'rejected';

export interface InternshipApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  eligibility: string;
  deadline: string;
  skills: string[];
  status: ApplicationStatus;
  notes: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

// --- Learning Session ---
export interface LearningSession {
  id: string;
  conceptId: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  type: 'learn' | 'practice' | 'review' | 'recall';
  completed: boolean;
}

// --- Spaced Repetition ---
export interface ReviewItem {
  id: string;
  conceptId: string;
  conceptName: string;
  nextReview: string;
  interval: number; // days
  ease: number;
  reviewCount: number;
}

// --- Bhai Chat ---
export interface BhaiMessage {
  id: string;
  role: 'user' | 'bhai';
  content: string;
  timestamp: string;
  conceptId?: string;
  type: 'text' | 'quiz' | 'hint' | 'explanation' | 'feedback';
}

// --- LeetCode ---
export interface LeetCodeContest {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  url: string;
  platform: string;
}

// --- Preparation Map ---
export interface PrepStep {
  id: string;
  name: string;
  status: SkillStatus;
  order: number;
  estimatedTime: string;
  resources: string[];
}

export interface PreparationMap {
  opportunityId: string;
  steps: PrepStep[];
  totalTime: string;
  whatYouKnow: string[];
  needsRevision: string[];
  needToLearn: string[];
  highPriority: string[];
}

// --- Resource ---
export type ResourceType = 'notes' | 'video' | 'documentation' | 'course' | 'article' | 'practice' | 'project' | 'dataset';

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  source: string;
  difficulty: Difficulty;
  estimatedTime: string;
  url: string;
  lastVerified: string;
  conceptId: string;
}

// --- Daily Activity ---
export interface DailyStats {
  date: string;
  learningMinutes: number;
  problemsSolved: number;
  problemsAttempted: number;
  reviewsDone: number;
  reviewsDue: number;
  sessionsCompleted: number;
}

// --- Notifications ---
export type NotificationCategory = 'all' | 'new' | 'deadlines' | 'internships' | 'contests' | 'cybersecurity' | 'learning';

export interface NamedNotification {
  id: string;
  category: 'new' | 'deadlines' | 'internships' | 'contests' | 'cybersecurity' | 'learning';
  company: string;
  title: string;
  deadline: string;
  matchReason: string;
  source: string;
  read: boolean;
  saved?: boolean;
  url?: string;
  opportunityId?: string;
  actionDestination?: { page: PageId; id?: string };
}

// --- Command Palette ---
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  action: () => void;
  category: string;
  shortcut?: string;
}

// --- Career Compass ---
export type CareerTrackId = 
  | 'ai_ml'
  | 'data_science'
  | 'full_stack'
  | 'cybersecurity'
  | 'cloud_devops'
  | 'data_engineering'
  | 'backend_systems'
  | 'product_tech'
  | 'applied_research'
  | 'mobile_dev';

export type SignalStrength = 'strong' | 'moderate' | 'developing';

export interface InterestSignal {
  trackId: CareerTrackId;
  title: string;
  strength: SignalStrength;
  score: number;
  percentage: number;
  whyThisAppeared: string[];
  observedPreferences: string[];
  suggestedFirstStep: string;
}

export interface CompassQuestion {
  id: number;
  questionText: string;
  bhaiHint: string;
  options: {
    id: string;
    text: string;
    description: string;
    weights: Partial<Record<CareerTrackId, number>>;
  }[];
}

export interface UserCareerExperiment {
  trackId: CareerTrackId;
  interactiveType: 'ml_tuning' | 'packet_inspect' | 'api_mock' | 'docker_logs';
  enjoymentRating: 'loved' | 'liked' | 'neutral' | 'disliked' | null;
  enjoyedPart?: string;
  frustratingPart?: string;
  completedAt?: string;
}

