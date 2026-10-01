// ===== Mock Data for BHOLENATH OS =====
// This provides realistic data for the MVP while the real data layer is built.

import type { 
  SkillNode, Concept, Problem, Opportunity, InternshipApplication,
  ReviewItem, LeetCodeContest, DailyStats, Mistake, Resource 
} from '../types';

// --- Skill Roadmap Data ---
export const skillNodes: SkillNode[] = [
  { id: 'arrays', name: 'Arrays', category: 'DSA', status: 'mastered', children: ['hashing', 'two-pointers'], prerequisites: [], description: 'Linear data structure basics', conceptCount: 8, completedConcepts: 8 },
  { id: 'hashing', name: 'Hashing', category: 'DSA', status: 'mastered', children: ['binary-search'], prerequisites: ['arrays'], description: 'Hash maps and hash sets', conceptCount: 6, completedConcepts: 6 },
  { id: 'two-pointers', name: 'Two Pointers', category: 'DSA', status: 'comfortable', children: ['sliding-window'], prerequisites: ['arrays'], description: 'Two pointer technique', conceptCount: 5, completedConcepts: 4 },
  { id: 'sliding-window', name: 'Sliding Window', category: 'DSA', status: 'learning', children: ['binary-search'], prerequisites: ['two-pointers'], description: 'Window-based optimization', conceptCount: 6, completedConcepts: 2 },
  { id: 'binary-search', name: 'Binary Search', category: 'DSA', status: 'learning', children: ['trees'], prerequisites: ['hashing', 'sliding-window'], description: 'Divide and conquer search', conceptCount: 7, completedConcepts: 3 },
  { id: 'trees', name: 'Trees', category: 'DSA', status: 'not_started', children: ['graphs', 'bst'], prerequisites: ['binary-search'], description: 'Hierarchical data structures', conceptCount: 10, completedConcepts: 0 },
  { id: 'bst', name: 'BST', category: 'DSA', status: 'not_started', children: ['heaps'], prerequisites: ['trees'], description: 'Binary Search Trees', conceptCount: 6, completedConcepts: 0 },
  { id: 'heaps', name: 'Heaps', category: 'DSA', status: 'not_started', children: ['graphs'], prerequisites: ['bst'], description: 'Priority queue structure', conceptCount: 5, completedConcepts: 0 },
  { id: 'graphs', name: 'Graphs', category: 'DSA', status: 'not_started', children: ['dp'], prerequisites: ['trees', 'heaps'], description: 'Graph traversal and algorithms', conceptCount: 12, completedConcepts: 0 },
  { id: 'dp', name: 'Dynamic Programming', category: 'DSA', status: 'not_started', children: [], prerequisites: ['graphs'], description: 'Optimal substructure and overlapping subproblems', conceptCount: 15, completedConcepts: 0 },
  { id: 'strings', name: 'Strings', category: 'DSA', status: 'comfortable', children: ['binary-search'], prerequisites: ['arrays'], description: 'String manipulation and algorithms', conceptCount: 7, completedConcepts: 5 },
  { id: 'linked-lists', name: 'Linked Lists', category: 'DSA', status: 'comfortable', children: ['trees'], prerequisites: ['arrays'], description: 'Sequential node-based structures', conceptCount: 6, completedConcepts: 5 },
  { id: 'stacks-queues', name: 'Stacks & Queues', category: 'DSA', status: 'mastered', children: ['trees'], prerequisites: ['arrays', 'linked-lists'], description: 'LIFO and FIFO structures', conceptCount: 6, completedConcepts: 6 },
  { id: 'recursion', name: 'Recursion', category: 'DSA', status: 'comfortable', children: ['trees', 'dp'], prerequisites: ['arrays'], description: 'Recursive problem solving', conceptCount: 8, completedConcepts: 6 },
  // Web Dev
  { id: 'html-css', name: 'HTML & CSS', category: 'Web Development', status: 'comfortable', children: ['javascript'], prerequisites: [], description: 'Web foundations', conceptCount: 10, completedConcepts: 8 },
  { id: 'javascript', name: 'JavaScript', category: 'Web Development', status: 'comfortable', children: ['react', 'nodejs'], prerequisites: ['html-css'], description: 'Core JavaScript', conceptCount: 12, completedConcepts: 9 },
  { id: 'react', name: 'React', category: 'Web Development', status: 'learning', children: ['nextjs'], prerequisites: ['javascript'], description: 'React framework', conceptCount: 10, completedConcepts: 4 },
  { id: 'nodejs', name: 'Node.js', category: 'Web Development', status: 'learning', children: ['nextjs'], prerequisites: ['javascript'], description: 'Server-side JavaScript', conceptCount: 8, completedConcepts: 2 },
  { id: 'nextjs', name: 'Next.js', category: 'Web Development', status: 'not_started', children: [], prerequisites: ['react', 'nodejs'], description: 'Full-stack React framework', conceptCount: 8, completedConcepts: 0 },
  // AI/ML
  { id: 'python', name: 'Python', category: 'AI/ML', status: 'comfortable', children: ['numpy-pandas'], prerequisites: [], description: 'Python programming', conceptCount: 10, completedConcepts: 8 },
  { id: 'numpy-pandas', name: 'NumPy & Pandas', category: 'AI/ML', status: 'learning', children: ['statistics'], prerequisites: ['python'], description: 'Data manipulation libraries', conceptCount: 8, completedConcepts: 3 },
  { id: 'statistics', name: 'Statistics', category: 'AI/ML', status: 'not_started', children: ['ml-basics'], prerequisites: ['numpy-pandas'], description: 'Statistical foundations', conceptCount: 10, completedConcepts: 0 },
  { id: 'ml-basics', name: 'ML Fundamentals', category: 'AI/ML', status: 'not_started', children: [], prerequisites: ['statistics'], description: 'Core machine learning concepts', conceptCount: 12, completedConcepts: 0 },
  // Core CS
  { id: 'oop', name: 'OOP', category: 'Core CS', status: 'comfortable', children: [], prerequisites: [], description: 'Object-oriented programming', conceptCount: 8, completedConcepts: 6 },
  { id: 'os', name: 'Operating Systems', category: 'Core CS', status: 'learning', children: [], prerequisites: [], description: 'OS concepts', conceptCount: 10, completedConcepts: 3 },
  { id: 'cn', name: 'Computer Networks', category: 'Core CS', status: 'not_started', children: [], prerequisites: [], description: 'Networking fundamentals', conceptCount: 10, completedConcepts: 0 },
  { id: 'dbms', name: 'Database', category: 'Core CS', status: 'learning', children: [], prerequisites: [], description: 'Database management', conceptCount: 8, completedConcepts: 2 },
  { id: 'system-design', name: 'System Design', category: 'Core CS', status: 'not_started', children: [], prerequisites: ['os', 'cn', 'dbms'], description: 'Designing scalable systems', conceptCount: 10, completedConcepts: 0 },
  // Cybersecurity (First-Class Track - Section 20)
  { id: 'cyber-fundamentals', name: 'Security Fundamentals', category: 'Cybersecurity', status: 'comfortable', children: ['networking-sec', 'linux-sec'], prerequisites: [], description: 'CIA triad, threat modeling, attack surfaces & defensive architecture', conceptCount: 6, completedConcepts: 4 },
  { id: 'networking-sec', name: 'Network Security', category: 'Cybersecurity', status: 'learning', children: ['web-sec'], prerequisites: ['cyber-fundamentals'], description: 'TCP/IP protocols, packet analysis, Wireshark, ports & DNS security', conceptCount: 8, completedConcepts: 3 },
  { id: 'linux-sec', name: 'Linux Security & Privileges', category: 'Cybersecurity', status: 'comfortable', children: ['web-sec'], prerequisites: ['cyber-fundamentals'], description: 'File permissions, sudo rights, bash auditing, process isolation', conceptCount: 7, completedConcepts: 5 },
  { id: 'web-sec', name: 'Web Security (OWASP Top 10)', category: 'Cybersecurity', status: 'learning', children: ['cryptography'], prerequisites: ['networking-sec', 'linux-sec'], description: 'SQL Injection, XSS, CSRF, broken authentication, IDOR vulnerabilities', conceptCount: 10, completedConcepts: 3 },
  { id: 'cryptography', name: 'Applied Cryptography', category: 'Cybersecurity', status: 'not_started', children: ['ctf-labs'], prerequisites: ['web-sec'], description: 'Symmetric & Asymmetric ciphers, SHA-256, RSA, TLS certificates, signatures', conceptCount: 8, completedConcepts: 0 },
  { id: 'ctf-labs', name: 'Legal CTFs & Hands-On Labs', category: 'Cybersecurity', status: 'learning', children: [], prerequisites: ['web-sec'], description: 'PicoCTF, OverTheWire Bandit, PortSwigger Web Security Academy sandboxes', conceptCount: 12, completedConcepts: 4 },
];

// --- Concepts (Full Coverage for All Tech Tracks) ---
import { allLearningConcepts } from './learningConceptsData';
export const sampleConcepts: Concept[] = allLearningConcepts;

// --- Practice Problems ---
export const sampleProblems: Problem[] = [
  { id: 'p1', title: 'Binary Search', platform: 'LeetCode', difficulty: 'beginner', topic: ['binary-search'], url: 'https://leetcode.com/problems/binary-search/', status: 'solved', conceptId: 'bs-intro', hintsUsed: 0 },
  { id: 'p2', title: 'Search Insert Position', platform: 'LeetCode', difficulty: 'beginner', topic: ['binary-search'], url: 'https://leetcode.com/problems/search-insert-position/', status: 'solved', conceptId: 'bs-variations', hintsUsed: 0 },
  { id: 'p3', title: 'Find First and Last Position', platform: 'LeetCode', difficulty: 'intermediate', topic: ['binary-search'], url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', status: 'attempted', conceptId: 'bs-variations', hintsUsed: 1 },
  { id: 'p4', title: 'Search in Rotated Sorted Array', platform: 'LeetCode', difficulty: 'intermediate', topic: ['binary-search'], url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', status: 'unsolved', conceptId: 'bs-variations', hintsUsed: 0 },
  { id: 'p5', title: 'Koko Eating Bananas', platform: 'LeetCode', difficulty: 'intermediate', topic: ['binary-search'], url: 'https://leetcode.com/problems/koko-eating-bananas/', status: 'unsolved', conceptId: 'bs-on-answer', hintsUsed: 0 },
  { id: 'p6', title: 'Two Sum II - Input Array Is Sorted', platform: 'LeetCode', difficulty: 'intermediate', topic: ['two-pointers'], url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', status: 'solved', conceptId: 'two-pointers-intro', hintsUsed: 0 },
  { id: 'p7', title: '3Sum', platform: 'LeetCode', difficulty: 'intermediate', topic: ['two-pointers'], url: 'https://leetcode.com/problems/3sum/', status: 'unsolved', conceptId: 'two-pointers-intro', hintsUsed: 1 },
  { id: 'p8', title: 'Two Sum', platform: 'LeetCode', difficulty: 'beginner', topic: ['arrays', 'hashing'], url: 'https://leetcode.com/problems/two-sum/', status: 'solved', conceptId: 'hashing-intro', hintsUsed: 0 },
  { id: 'p9', title: 'Valid Parentheses', platform: 'LeetCode', difficulty: 'beginner', topic: ['stacks-queues'], url: 'https://leetcode.com/problems/valid-parentheses/', status: 'solved', conceptId: 'stacks-queues-intro', hintsUsed: 0 },
  { id: 'p10', title: 'Longest Substring Without Repeating', platform: 'LeetCode', difficulty: 'intermediate', topic: ['sliding-window', 'hashing'], url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', status: 'solved', conceptId: 'sliding-window-intro', hintsUsed: 0 },
  { id: 'p11', title: 'Reverse Linked List', platform: 'LeetCode', difficulty: 'beginner', topic: ['linked-lists'], url: 'https://leetcode.com/problems/reverse-linked-list/', status: 'solved', conceptId: 'linked-lists-intro', hintsUsed: 0 },
  { id: 'p12', title: 'Valid Anagram', platform: 'LeetCode', difficulty: 'beginner', topic: ['strings', 'hashing'], url: 'https://leetcode.com/problems/valid-anagram/', status: 'solved', conceptId: 'strings-intro', hintsUsed: 0 },
  { id: 'p13', title: 'Subsets', platform: 'LeetCode', difficulty: 'intermediate', topic: ['recursion'], url: 'https://leetcode.com/problems/subsets/', status: 'solved', conceptId: 'recursion-intro', hintsUsed: 0 },
  { id: 'p14', title: 'Binary Tree Level Order Traversal', platform: 'LeetCode', difficulty: 'intermediate', topic: ['trees'], url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', status: 'unsolved', conceptId: 'trees-intro', hintsUsed: 0 },
  { id: 'p15', title: 'SQL Injection Lab: Login Bypass', platform: 'PortSwigger', difficulty: 'beginner', topic: ['web-sec'], url: 'https://portswigger.net/web-security/sql-injection', status: 'solved', conceptId: 'web-sec-intro', hintsUsed: 0 },
  { id: 'p16', title: 'OverTheWire: Bandit Level 0-5', platform: 'OverTheWire', difficulty: 'beginner', topic: ['linux-sec'], url: 'https://overthewire.org/wargames/bandit/', status: 'solved', conceptId: 'linux-sec-intro', hintsUsed: 0 },
];

// --- Opportunities ---
export const sampleOpportunities: Opportunity[] = [
  {
    id: 'opp1', title: 'ML Challenge 2026', organizer: 'Amazon', type: 'hackathon',
    description: 'Build ML models for real-world Amazon problems. Open to university students.',
    startDate: '2026-10-10', endDate: '2026-10-12', deadline: '2026-10-05',
    skills: ['Python', 'Machine Learning', 'Statistics', 'Data Analysis'],
    url: 'https://amazon.com/ml-challenge', source: 'Amazon Careers', sourceUrl: 'https://amazon.com/careers',
    lastVerified: '2026-09-30', location: 'Online', mode: 'online', eligibility: 'University students', prize: 'Internship opportunities + prizes',
    prepPlan: {
      rounds: [
        { name: 'Round 1: Quiz & Fundamentals', type: 'Online Test', description: '45-minute MCQs on Statistics, ML algorithms, Matrix calculus & Python', duration: '45 mins' },
        { name: 'Round 2: Problem Statement & Dataset', type: 'Hackathon', description: 'Dataset release; clean data, baseline models, metric optimization', duration: '48 hours' },
        { name: 'Round 3: Final Leaderboard & Submission', type: 'Evaluation', description: 'Dockerized submission, reproducible notebook and executive summary', duration: '24 hours' },
      ],
      keyConcepts: [
        { id: 'c1', name: 'Feature Engineering & Imputation', category: 'ML', importance: 'essential', notes: 'Handle numerical skews with log/box-cox, target encoding for high cardinality categoricals, create interaction terms.', bhaiPrompt: 'Bhai, explain feature engineering strategies for tabular datasets' },
        { id: 'c2', name: 'Gradient Boosting (LightGBM/XGBoost)', category: 'ML', importance: 'essential', notes: 'Tree depth, learning rate tuning, early stopping on stratified validation splits.', bhaiPrompt: 'Bhai, teach me how to tune XGBoost hyperparameters properly' },
        { id: 'c3', name: 'Cross Validation & Leakage Prevention', category: 'ML', importance: 'high', notes: 'Never fit scalers/encoders on test fold; use StratifiedKFold or GroupKFold when grouping by user.', bhaiPrompt: 'Bhai, what is data leakage in ML and how to prevent it?' },
        { id: 'c4', name: 'Model Ensembling & Blending', category: 'ML', importance: 'high', notes: 'Rank averaging, weighted probability blend across diverse models (Trees + Ridge + Neural Net).', bhaiPrompt: 'Bhai, how does ensembling work in competitive ML?' },
      ],
      resources: [
        { title: 'End-to-End Machine Learning Pipeline Guide', url: 'https://scikit-learn.org/stable/modules/compose.html', type: 'documentation', source: 'Scikit-Learn Docs', duration: '30 min read' },
        { title: 'LightGBM Parameter Tuning Handbook', url: 'https://lightgbm.readthedocs.io/en/latest/Parameters-Tuning.html', type: 'documentation', source: 'LightGBM Docs', duration: '25 min read' },
        { title: 'Kaggle Grandmaster Walkthrough: Tabular Winning Strategies', url: 'https://www.youtube.com', type: 'video', source: 'Kaggle Community', duration: '52 min' },
      ],
      practiceProblems: [
        { id: 'ml-p1', title: 'Feature Preprocessing & Imputation Pipeline', difficulty: 'beginner', platform: 'Kaggle', url: 'https://www.kaggle.com/c/titanic', topic: 'Data Preprocessing' },
        { id: 'ml-p2', title: 'House Prices Advanced Regression (XGBoost)', difficulty: 'intermediate', platform: 'Kaggle', url: 'https://www.kaggle.com/c/house-prices-advanced-regression-techniques', topic: 'Ensembling' },
        { id: 'ml-p3', title: 'Multiclass Classification with Evaluation Metric', difficulty: 'intermediate', platform: 'HackerEarth', url: 'https://www.hackerearth.com/challenges/', topic: 'Model Selection' },
      ],
      roadmapPhases: [
        { phase: 'Phase 1: Foundations & Setup', timeframe: 'Day 1 - 2', goals: ['Configure Python env, Pandas & LightGBM', 'Review ML metrics (F1, LogLoss, ROC-AUC)', 'Set up local stratified 5-fold CV'] },
        { phase: 'Phase 2: Baseline & Feature Engineering', timeframe: 'Day 3 - 4', goals: ['Establish simple baseline benchmark', 'Extract aggregation & ratio features', 'Verify local CV correlates with leaderboard'] },
        { phase: 'Phase 3: Ensembling & Final Polish', timeframe: 'Day 5', goals: ['Blend top 3 diverse model predictions', 'Package clean inference script', 'Submit before deadline'] },
      ]
    }
  },
  {
    id: 'opp2', title: 'Weekly Contest 420', organizer: 'LeetCode', type: 'contest',
    description: 'Weekly competitive programming contest on LeetCode.',
    startDate: '2026-10-04T08:00:00+05:30', endDate: '2026-10-04T09:30:00+05:30', deadline: '2026-10-04',
    skills: ['DSA', 'Problem Solving', 'Algorithms'],
    url: 'https://leetcode.com/contest/', source: 'LeetCode', sourceUrl: 'https://leetcode.com',
    lastVerified: '2026-10-01', location: 'Online', mode: 'online', eligibility: 'Anyone', prize: 'Rating change',
    prepPlan: {
      rounds: [
        { name: 'Q1 (Easy)', type: 'Warmup', description: 'Implementation, hash maps, simple simulation (5-10 mins target)', duration: '10 mins' },
        { name: 'Q2 (Medium)', type: 'Core DSA', description: 'Sliding window, binary search, two pointers, prefix sums (15-20 mins)', duration: '20 mins' },
        { name: 'Q3 (Medium/Hard)', type: 'Advanced DSA', description: 'DFS/BFS, Dynamic Programming, Heap/Greedy (25-35 mins)', duration: '35 mins' },
        { name: 'Q4 (Hard)', type: 'Hard Algorithmic', description: 'Bitmask DP, Segment Tree, Advanced Graphs, Math (25-35 mins)', duration: '35 mins' },
      ],
      keyConcepts: [
        { id: 'lc-c1', name: 'Binary Search on Answer Range', category: 'Algorithms', importance: 'essential', notes: 'Check monotonicity: if isValid(mid) is true, shrink search boundary.', bhaiPrompt: 'Bhai, explain binary search on answer with an example' },
        { id: 'lc-c2', name: 'Prefix Sums + Hash Map', category: 'DSA', importance: 'essential', notes: 'Quick subarray sum lookup in O(1) time after O(N) precomputation.', bhaiPrompt: 'Bhai, how does subarray sum equal K work using hashmap?' },
        { id: 'lc-c3', name: 'BFS Level-Order & Shortest Path', category: 'Graphs', importance: 'high', notes: 'Use queue, track visited set immediately upon pushing to avoid redundant checks.', bhaiPrompt: 'Bhai, explain standard BFS graph traversal template' },
      ],
      resources: [
        { title: 'LeetCode Contest Strategy & Mental Models', url: 'https://leetcode.com/discuss/general-discussion', type: 'guide', source: 'LeetCode Discuss', duration: '20 min read' },
        { title: 'NeetCode Contest Solving Speed Tactics', url: 'https://www.youtube.com', type: 'video', source: 'NeetCode', duration: '35 min' },
      ],
      practiceProblems: [
        { id: 'lc-p1', title: 'Binary Search', difficulty: 'beginner', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-search/', topic: 'Binary Search' },
        { id: 'lc-p2', title: 'Subarray Sum Equals K', difficulty: 'intermediate', platform: 'LeetCode', url: 'https://leetcode.com/problems/subarray-sum-equals-k/', topic: 'Prefix Sum' },
        { id: 'lc-p3', title: 'Number of Islands', difficulty: 'intermediate', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-islands/', topic: 'BFS/DFS' },
      ],
      roadmapPhases: [
        { phase: 'Warmup & Template Ready', timeframe: 'Day -1', goals: ['Review fast I/O and standard templates', 'Solve 2 random medium problems without hints'] },
        { phase: 'Live Contest Execution', timeframe: 'Contest Day (8:00 AM IST)', goals: ['Scan all 4 problems', 'Target Q1+Q2 in first 25 mins', 'Attempt Q3 with clean pen-paper test case tracing'] },
        { phase: 'Upsolving & Mistake Log', timeframe: 'Post Contest', goals: ['Upsolve Q3/Q4 within 24 hours', 'Log mistakes into Bholenath Mistake Notebook'] },
      ]
    }
  },
  {
    id: 'opp3', title: 'HackMIT 2026', organizer: 'MIT', type: 'hackathon',
    description: 'Annual hackathon organized by MIT students. Build something amazing in 24 hours.',
    startDate: '2026-10-20', endDate: '2026-10-21', deadline: '2026-10-10',
    skills: ['Full Stack', 'React', 'Node.js', 'APIs', 'UI/UX'],
    url: 'https://hackmit.org', source: 'HackMIT', sourceUrl: 'https://hackmit.org',
    lastVerified: '2026-09-28', location: 'Cambridge, MA', mode: 'hybrid', eligibility: 'University students', prize: '$10,000 in prizes',
    prepPlan: {
      rounds: [
        { name: 'Application & Portfolio Review', type: 'Screening', description: 'Evaluation of GitHub projects, essays, and technical interests' },
        { name: 'Team Formation & Ideation', type: 'Preparation', description: 'Finalize 3-4 member team and problem track' },
        { name: '24-Hour Hack & Expo Demo', type: 'Hackathon', description: 'Live coding, mentor feedback sessions, and 3-minute expo pitch to judges' },
      ],
      keyConcepts: [
        { id: 'h-c1', name: 'Rapid Full-Stack Prototyping', category: 'Development', importance: 'essential', notes: 'Use pre-tested templates (Vite + Tailwind + Express + SQLite/Supabase) to start coding in minutes.', bhaiPrompt: 'Bhai, what is the best tech stack for a 24-hour hackathon?' },
        { id: 'h-c2', name: 'API Integration & WebSockets', category: 'Backend', importance: 'high', notes: 'Hook up AI APIs (OpenAI/Anthropic/Gemini) with real-time UI streaming.', bhaiPrompt: 'Bhai, how to stream LLM responses in React quickly?' },
        { id: 'h-c3', name: 'Pitching & Visual Demo Polish', category: 'Product', importance: 'essential', notes: 'Judges spend 3 minutes. Focus 80% on working UI demo and user story, 20% on architecture.', bhaiPrompt: 'Bhai, give me tips on how to win a hackathon demo round' },
      ],
      resources: [
        { title: 'Hackathon Survival Guide: Ideation to Demo', url: 'https://hackmit.org', type: 'guide', source: 'MIT Tech Club', duration: '20 min read' },
        { title: 'Figma to Working Code in 2 Hours', url: 'https://developer.mozilla.org', type: 'documentation', source: 'MDN Web Docs', duration: '40 min' },
      ],
      practiceProblems: [
        { id: 'h-p1', title: 'Build and Deploy a React Auth & CRUD MVP', difficulty: 'intermediate', platform: 'GitHub', url: 'https://github.com', topic: 'Full Stack' },
        { id: 'h-p2', title: 'Integrate Streaming REST / AI endpoint', difficulty: 'intermediate', platform: 'GitHub', url: 'https://github.com', topic: 'API Integration' },
      ],
      roadmapPhases: [
        { phase: 'Team & Project Proposal', timeframe: 'Week 1', goals: ['Align team on track (Health, AI, FinTech)', 'Prepare GitHub template repository'] },
        { phase: 'Hackathon 24-hr Sprint', timeframe: 'Hack Day', goals: ['Hour 0-4: DB & APIs live', 'Hour 5-16: Core feature UI', 'Hour 17-22: Demo polish & video', 'Hour 23-24: Pitch practice'] },
      ]
    }
  },
  {
    id: 'opp4', title: 'Google Summer of Code 2027', organizer: 'Google', type: 'program',
    description: 'Contribute to open-source projects mentored by experienced developers.',
    startDate: '2027-05-01', endDate: '2027-08-31', deadline: '2027-03-15',
    skills: ['Open Source', 'Git', 'Programming'],
    url: 'https://summerofcode.withgoogle.com', source: 'Google', sourceUrl: 'https://summerofcode.withgoogle.com',
    lastVerified: '2026-09-30', location: 'Remote', mode: 'online', eligibility: 'University students 18+', prize: 'Stipend + experience',
    prepPlan: {
      rounds: [
        { name: 'Organization List Announcement', type: 'Discovery', description: 'Google releases participating open source organizations' },
        { name: 'Community Bonding & Contributions', type: 'Open Source', description: 'Solve issues, join Zulip/IRC, submit PRs, get code reviewed' },
        { name: 'Proposal Writing & Submission', type: 'Proposal', description: 'Write detailed 10-15 page project proposal with milestones' },
      ],
      keyConcepts: [
        { id: 'g-c1', name: 'Interactive Git Workflow', category: 'DevOps', importance: 'essential', notes: 'Master git rebase -i, squash, signing commits, and resolving merge conflicts cleanly.', bhaiPrompt: 'Bhai, explain git rebase and squash workflow for open source' },
        { id: 'g-c2', name: 'Open Source Proposal Writing', category: 'Engineering', importance: 'essential', notes: 'Clear deliverables, weekly milestone schedule, fallback plans, and proof of prior commits.', bhaiPrompt: 'Bhai, how should I write a winning GSoC proposal?' },
      ],
      resources: [
        { title: 'Google Summer of Code Official Student Guide', url: 'https://summerofcode.withgoogle.com/rules', type: 'guide', source: 'Google Open Source', duration: '30 min read' },
        { title: 'Git Documentation & Best Practices', url: 'https://git-scm.com/doc', type: 'documentation', source: 'Git SCM', duration: '45 min' },
      ],
      practiceProblems: [
        { id: 'g-p1', title: 'Fork, Clone & Build Local Dev Environment of Selected Org', difficulty: 'beginner', platform: 'GitHub', url: 'https://github.com', topic: 'Git' },
        { id: 'g-p2', title: 'Solve 1 "good first issue" and get PR merged', difficulty: 'intermediate', platform: 'GitHub', url: 'https://github.com', topic: 'Open Source PR' },
      ],
      roadmapPhases: [
        { phase: 'Org Selection & Setup', timeframe: 'Month 1', goals: ['Pick 2 organizations', 'Build project locally', 'Introduce yourself in channels'] },
        { phase: 'First PRs & Bonding', timeframe: 'Month 2', goals: ['Fix 2 bug issues', 'Engage in pull request code reviews'] },
        { phase: 'Proposal Drafting', timeframe: 'Month 3', goals: ['Draft proposal with mentor feedback', 'Submit before official Google deadline'] },
      ]
    }
  },
  {
    id: 'opp5', title: 'Codeforces Round #900', organizer: 'Codeforces', type: 'contest',
    description: 'Div. 2 competitive programming contest.',
    startDate: '2026-10-03T20:35:00+05:30', endDate: '2026-10-03T22:35:00+05:30', deadline: '2026-10-03',
    skills: ['DSA', 'Algorithms', 'Math', 'Problem Solving'],
    url: 'https://codeforces.com/contests', source: 'Codeforces', sourceUrl: 'https://codeforces.com',
    lastVerified: '2026-10-01', location: 'Online', mode: 'online', eligibility: 'Anyone', prize: 'Rating change',
    prepPlan: {
      rounds: [
        { name: 'Div. 2 Contest (Problems A to F)', type: 'Contest', description: '2 hours, penalty for wrong submissions, fast rating updates', duration: '2 hours' }
      ],
      keyConcepts: [
        { id: 'cf-c1', name: 'Constructive Algorithms & Math Invariants', category: 'Math', importance: 'essential', notes: 'Look for parity, greedy choices, small bounds, or GCD/LCM properties.', bhaiPrompt: 'Bhai, how to think in constructive algorithms for Codeforces?' },
        { id: 'cf-c2', name: 'Two Pointers & Sliding Windows', category: 'DSA', importance: 'essential', notes: 'Maintain window validity while advancing right pointer.', bhaiPrompt: 'Bhai, teach me sliding window tricks for contest questions' },
      ],
      resources: [
        { title: 'CP-Algorithms: Competitive Programming Guide', url: 'https://cp-algorithms.com', type: 'documentation', source: 'CP-Algorithms', duration: '40 min' },
      ],
      practiceProblems: [
        { id: 'cf-p1', title: 'Watermelon & Way Too Long Words', difficulty: 'beginner', platform: 'Codeforces', url: 'https://codeforces.com/problemset/problem/4/A', topic: 'Math' },
        { id: 'cf-p2', title: 'Two Pointers & Binary Search Div 2', difficulty: 'intermediate', platform: 'Codeforces', url: 'https://codeforces.com/problemset', topic: 'Binary Search' },
      ],
      roadmapPhases: [
        { phase: 'Warmup', timeframe: 'Contest Evening', goals: ['Solve 2 Div2 A/B problems', 'Review fast I/O setup'] },
        { phase: 'Live Contest', timeframe: '20:35 - 22:35 IST', goals: ['Lock Div2 A in first 5 mins', 'Ensure no wrong submissions on B'] },
      ]
    }
  },
  {
    id: 'opp6', title: 'Microsoft Engage 2027', organizer: 'Microsoft', type: 'internship',
    description: 'Mentorship program for engineering students with project-based learning.',
    startDate: '2027-04-01', endDate: '2027-06-30', deadline: '2027-02-15',
    skills: ['Web Development', 'Cloud', 'AI/ML', 'System Design'],
    url: 'https://microsoft.com/engage', source: 'Microsoft Careers', sourceUrl: 'https://careers.microsoft.com',
    lastVerified: '2026-09-25', location: 'India', mode: 'hybrid', eligibility: 'B.Tech students', prize: 'Internship + PPO opportunity',
    prepPlan: {
      rounds: [
        { name: 'Round 1: Online Assessment (OA)', type: 'Coding Test', description: '2 DSA problems (Medium/Hard) + 10 Core CS/OOP MCQs', duration: '90 mins' },
        { name: 'Round 2: Mentorship Project Sprint', type: 'Project', description: '4-week project build with weekly Microsoft mentor 1:1 syncs' },
        { name: 'Round 3: Final Project Evaluation & Technical Interview', type: 'Interview', description: 'Code walkthrough, system architecture, OOP design patterns & behavioral' },
      ],
      keyConcepts: [
        { id: 'ms-c1', name: 'Object-Oriented Design Patterns', category: 'Software Design', importance: 'essential', notes: 'SOLID principles, Factory, Singleton, Strategy patterns in real code.', bhaiPrompt: 'Bhai, explain SOLID principles with simple real-life examples' },
        { id: 'ms-c2', name: 'Tree & Graph Traversal (DFS/BFS)', category: 'DSA', importance: 'essential', notes: 'Level order traversal, cycle detection, topological sort.', bhaiPrompt: 'Bhai, teach me topological sort and when to use it' },
        { id: 'ms-c3', name: 'REST API Design & Cloud Deployment', category: 'Web', importance: 'high', notes: 'Idempotency, HTTP status codes, Docker containerization, Azure App Service.', bhaiPrompt: 'Bhai, how to design clean RESTful APIs?' },
      ],
      resources: [
        { title: 'Microsoft Learn: Cloud Fundamentals & C# / TypeScript', url: 'https://learn.microsoft.com', type: 'documentation', source: 'Microsoft Learn', duration: '45 min' },
        { title: 'System Design Interview Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'guide', source: 'GitHub Open Source', duration: '60 min' },
      ],
      practiceProblems: [
        { id: 'ms-p1', title: 'Course Schedule (Topological Sort)', difficulty: 'intermediate', platform: 'LeetCode', url: 'https://leetcode.com/problems/course-schedule/', topic: 'Graphs' },
        { id: 'ms-p2', title: 'LRU Cache (HashMap + Doubly Linked List)', difficulty: 'intermediate', platform: 'LeetCode', url: 'https://leetcode.com/problems/lru-cache/', topic: 'Design' },
      ],
      roadmapPhases: [
        { phase: 'DSA & OA Preparation', timeframe: 'Weeks 1-3', goals: ['Master Graphs, Trees & DP top patterns', 'Practice 20 Microsoft-tagged LeetCode problems'] },
        { phase: 'Project Architecture & MVP', timeframe: 'Weeks 4-6', goals: ['Build core feature set with clean OOP structure', 'Add unit tests & CI/CD deployment'] },
        { phase: 'Interview & Code Defense', timeframe: 'Week 7', goals: ['Mock technical interview with Bade Bhai', 'Prepare deep dive on trade-offs made in the project'] },
      ]
    }
  },
  {
    id: 'opp-picoctf',
    title: 'PicoCTF 2026',
    organizer: 'Carnegie Mellon University',
    type: 'challenge',
    description: 'Premier cybersecurity capture-the-flag competition for students. Real-world cryptography, forensics, web exploitation and reverse engineering.',
    startDate: '2026-10-15',
    endDate: '2026-10-25',
    deadline: '2026-10-14',
    skills: ['Cybersecurity', 'Web Security', 'Cryptography', 'Linux', 'Network Protocols'],
    url: 'https://picoctf.org',
    source: 'PicoCTF Official',
    sourceUrl: 'https://picoctf.org',
    lastVerified: '2026-10-01',
    location: 'Online',
    mode: 'online',
    eligibility: 'High School & University Students',
    prize: 'Global Leaderboard Ranking + Certificates',
    prepPlan: {
      rounds: [
        { name: 'Warmup & General Skills', type: 'CTF Challenge', description: 'Linux CLI navigation, hex decoding, base64 analysis, netcat connections', duration: 'Self-paced' },
        { name: 'Web Exploitation & Forensics', type: 'CTF Challenge', description: 'Inspect cookies, SQL injection, packet capture analysis (.pcap), hidden metadata', duration: 'Self-paced' },
        { name: 'Cryptography & Binary Exploitation', type: 'Advanced Challenge', description: 'Caesar/RSA mathematics, buffer overflows, format string vulnerabilities', duration: 'Self-paced' },
      ],
      keyConcepts: [
        { id: 'sec-c1', name: 'Web Application Vulnerabilities (OWASP)', category: 'Web Security', importance: 'essential', notes: 'Sanitize user inputs, check cookies for HttpOnly/Secure flags, prevent parameter tampering.', bhaiPrompt: 'Bhai, explain SQL Injection and how to prevent it in web applications' },
        { id: 'sec-c2', name: 'Wireshark Packet Analysis & PCAP', category: 'Networking', importance: 'essential', notes: 'Filter by IP/protocol, follow TCP streams, look for cleartext HTTP credentials or suspicious DNS queries.', bhaiPrompt: 'Bhai, how do I analyze packet captures in Wireshark for CTFs?' },
        { id: 'sec-c3', name: 'Linux Permissions & SUID Privileges', category: 'Systems', importance: 'high', notes: 'Check file permission bits (rwx), SUID flags, and sudo privileges for privilege escalation.', bhaiPrompt: 'Bhai, explain Linux file permissions and SUID bits' },
      ],
      resources: [
        { title: 'PicoCTF Learning Guide & Practice Gym', url: 'https://picoctf.org', type: 'guide', source: 'Carnegie Mellon', duration: '40 min' },
        { title: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security', type: 'documentation', source: 'PortSwigger', duration: '60 min' },
        { title: 'OverTheWire: Bandit Beginner Linux Wargame', url: 'https://overthewire.org/wargames/bandit/', type: 'guide', source: 'OverTheWire', duration: '45 min' },
      ],
      practiceProblems: [
        { id: 'sec-p1', title: 'OverTheWire Bandit Level 0-10', difficulty: 'beginner', platform: 'OverTheWire', url: 'https://overthewire.org/wargames/bandit/', topic: 'Linux Security' },
        { id: 'sec-p2', title: 'PortSwigger SQL Injection Lab 1', difficulty: 'beginner', platform: 'PortSwigger', url: 'https://portswigger.net/web-security/sql-injection', topic: 'Web Security' },
      ],
      roadmapPhases: [
        { phase: 'Phase 1: Linux & Netcat Practice', timeframe: 'Day 1 - 2', goals: ['Complete Bandit levels 0-5', 'Practice netcat (nc) and curl command line tools'] },
        { phase: 'Phase 2: Web & Forensics Training', timeframe: 'Day 3 - 5', goals: ['Inspect DOM, cookies, and network payloads', 'Solve 5 beginner PicoGym forensics challenges'] },
        { phase: 'Phase 3: Live CTF Competition', timeframe: 'Contest Week', goals: ['Tackle challenges methodically', 'Keep clean notes of flags and commands in DevCareer OS'] },
      ]
    }
  },
];

// --- Internship Applications ---
export const sampleApplications: InternshipApplication[] = [
  {
    id: 'app1', company: 'Google', role: 'SWE Intern', location: 'Bangalore',
    eligibility: 'B.Tech 2028 batch', deadline: '2026-11-30', skills: ['DSA', 'System Design', 'Python/C++'],
    status: 'preparing', notes: 'Need to prepare graphs and DP', url: 'https://careers.google.com', createdAt: '2026-09-15', updatedAt: '2026-09-30',
  },
  {
    id: 'app2', company: 'Microsoft', role: 'SDE Intern', location: 'Hyderabad',
    eligibility: 'B.Tech 2028 batch', deadline: '2026-12-15', skills: ['DSA', 'OOP', 'System Design'],
    status: 'saved', notes: '', url: 'https://careers.microsoft.com', createdAt: '2026-09-20', updatedAt: '2026-09-20',
  },
];

// --- Review Items ---
export const sampleReviews: ReviewItem[] = [
  { id: 'r1', conceptId: 'bs-intro', conceptName: 'Binary Search Basics', nextReview: '2026-10-01', interval: 7, ease: 2.5, reviewCount: 3 },
  { id: 'r2', conceptId: 'bs-variations', conceptName: 'Binary Search Variations', nextReview: '2026-10-01', interval: 3, ease: 2.3, reviewCount: 2 },
  { id: 'r3', conceptId: 'two-pointers', conceptName: 'Two Pointers Technique', nextReview: '2026-10-02', interval: 14, ease: 2.7, reviewCount: 4 },
  { id: 'r4', conceptId: 'sliding-window-basics', conceptName: 'Sliding Window Basics', nextReview: '2026-10-03', interval: 3, ease: 2.1, reviewCount: 1 },
];

// --- LeetCode Contests ---
export const sampleContests: LeetCodeContest[] = [
  { id: 'lc1', title: 'Weekly Contest 420', startTime: '2026-10-04T08:00:00+05:30', duration: 90, url: 'https://leetcode.com/contest/weekly-contest-420/', platform: 'LeetCode' },
  { id: 'lc2', title: 'Biweekly Contest 142', startTime: '2026-10-11T20:00:00+05:30', duration: 90, url: 'https://leetcode.com/contest/biweekly-contest-142/', platform: 'LeetCode' },
  { id: 'lc3', title: 'Weekly Contest 421', startTime: '2026-10-11T08:00:00+05:30', duration: 90, url: 'https://leetcode.com/contest/weekly-contest-421/', platform: 'LeetCode' },
];

// --- Daily Stats ---
export const sampleDailyStats: DailyStats = {
  date: '2026-10-01',
  learningMinutes: 42,
  problemsSolved: 3,
  problemsAttempted: 5,
  reviewsDone: 1,
  reviewsDue: 2,
  sessionsCompleted: 2,
};

// --- Mistakes ---
export const sampleMistakes: Mistake[] = [
  {
    id: 'm1', problemId: 'p3', concept: 'Binary Search',
    whatITried: 'Used standard binary search with == check',
    whatWentWrong: 'Didn\'t handle finding the FIRST and LAST occurrence separately',
    correctIdea: 'Use two separate binary searches — one biased left, one biased right',
    howToAvoid: 'When problem asks for range/first/last, always think about lower_bound and upper_bound variants',
    reviewDate: '2026-10-03', createdAt: '2026-09-28', tags: ['binary-search', 'boundary'],
  },
  {
    id: 'm2', problemId: 'p10', concept: 'Sliding Window',
    whatITried: 'Used two nested loops to check all substrings',
    whatWentWrong: 'TLE — O(n²) approach too slow',
    correctIdea: 'Use sliding window with hash set. Expand right, shrink left when duplicate found.',
    howToAvoid: 'When dealing with contiguous subarrays/substrings with a constraint, think sliding window first',
    reviewDate: '2026-10-02', createdAt: '2026-09-25', tags: ['sliding-window', 'optimization'],
  },
];

// --- Resources ---
export const sampleResources: Resource[] = [
  { id: 'res1', title: 'Binary Search - CP Algorithms', type: 'documentation', source: 'cp-algorithms.com', difficulty: 'intermediate', estimatedTime: '20 min', url: 'https://cp-algorithms.com/num_methods/binary_search.html', lastVerified: '2026-09-30', conceptId: 'bs-intro' },
  { id: 'res2', title: 'Binary Search - GeeksforGeeks', type: 'article', source: 'GeeksforGeeks', difficulty: 'beginner', estimatedTime: '15 min', url: 'https://www.geeksforgeeks.org/binary-search/', lastVerified: '2026-09-30', conceptId: 'bs-intro' },
  { id: 'res3', title: 'NeetCode - Binary Search', type: 'video', source: 'YouTube', difficulty: 'beginner', estimatedTime: '12 min', url: 'https://www.youtube.com/watch?v=s4DPM8ct1pI', lastVerified: '2026-09-28', conceptId: 'bs-intro' },
  { id: 'res4', title: 'Striver - Binary Search Playlist', type: 'course', source: 'YouTube', difficulty: 'intermediate', estimatedTime: '3 hours', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0pMFMWuuvDNMAkoQFi-h0ZF', lastVerified: '2026-09-28', conceptId: 'bs-intro' },
];

// --- Activity Heatmap Data ---
export const activityData: { date: string; count: number }[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date('2026-07-04');
  d.setDate(d.getDate() + i);
  return {
    date: d.toISOString().split('T')[0],
    count: Math.random() > 0.3 ? Math.floor(Math.random() * 8) + 1 : 0,
  };
});
