import type { CodingProblem, CodingAttempt, ProblemRecommendation } from '../types/codingLab';
import { codingProblems } from '../data/codingLabProblems';

interface RecommendationContext {
  attempts: CodingAttempt[];
  targetRole?: string;
  compassFocusTopics?: string[];
  roadmapCurrentTopic?: string;
}

export function getRecommendedNextProblem(
  context: RecommendationContext
): ProblemRecommendation {
  const { attempts, targetRole = 'Software Development Engineer', compassFocusTopics = [], roadmapCurrentTopic } = context;

  // 1. Identify solved problem IDs
  const solvedProblemIds = new Set(
    attempts.filter(a => a.status === 'passed').map(a => a.problemId)
  );

  // 2. Identify failed attempts per topic
  const failedTopicCounts: Record<string, number> = {};
  const solvedTopicCounts: Record<string, number> = {};

  for (const a of attempts) {
    for (const t of a.topics) {
      if (a.status === 'passed') {
        solvedTopicCounts[t] = (solvedTopicCounts[t] || 0) + 1;
      } else {
        failedTopicCounts[t] = (failedTopicCounts[t] || 0) + 1;
      }
    }
  }

  // 3. Find candidates (unsolved problems)
  const unsolved = codingProblems.filter(p => !solvedProblemIds.has(p.id));

  // If user has solved everything, suggest the hardest problem or review
  if (unsolved.length === 0) {
    const hardProblem = codingProblems.find(p => p.difficulty === 'Hard') || codingProblems[0];
    return {
      problem: hardProblem,
      reason: 'Aapne sabhi standard practice problems solve kar liye hain! Mastery solid karne ke liye is problem ko optimal time complexity me bina hints ke dubara try kijiye.',
      confidence: 95,
      focusTopic: hardProblem.topics[0] || 'Advanced DSA',
    };
  }

  // Priority Rule 1: Topic with repeated mistakes (needs targeted practice)
  const weakTopic = Object.keys(failedTopicCounts).find(
    t => failedTopicCounts[t] >= 2 && (!solvedTopicCounts[t] || solvedTopicCounts[t] < failedTopicCounts[t])
  );

  if (weakTopic) {
    // Find an Easy or Medium unsolved problem in this weak topic
    const weakTopicProblem = unsolved.find(p => p.topics.includes(weakTopic) && p.difficulty !== 'Hard')
      || unsolved.find(p => p.topics.includes(weakTopic));

    if (weakTopicProblem) {
      return {
        problem: weakTopicProblem,
        reason: `Aapne ${weakTopic} me recent attempts me thodi difficulty face ki hai (${failedTopicCounts[weakTopic]} failed attempts). Yeh problem ${weakTopic} ke core intuition ko strengthen karne ke liye best next step hai.`,
        confidence: 92,
        focusTopic: weakTopic,
      };
    }
  }

  // Priority Rule 2: Active Roadmap topic
  if (roadmapCurrentTopic) {
    const roadmapProblem = unsolved.find(p => 
      p.topics.some(t => t.toLowerCase() === roadmapCurrentTopic.toLowerCase())
    );
    if (roadmapProblem) {
      return {
        problem: roadmapProblem,
        reason: `Yeh problem aapke active roadmap topic "${roadmapCurrentTopic}" se directly match karti hai. Roadmap milestones complete karne ke liye isse solve kijiye.`,
        confidence: 88,
        focusTopic: roadmapCurrentTopic,
      };
    }
  }

  // Priority Rule 3: Natural progression from Easy to Medium
  const solvedCount = solvedProblemIds.size;
  if (solvedCount === 0) {
    // First problem: Two Sum
    const firstProblem = unsolved.find(p => p.id === 'two-sum') || unsolved[0];
    return {
      problem: firstProblem,
      reason: 'Coding Lab ki shuruaat karne ke liye yeh classic Arrays aur Hashing problem sabse solid starting point hai.',
      confidence: 98,
      focusTopic: firstProblem.topics[0],
    };
  }

  if (solvedCount <= 3) {
    // Recommend foundational Easy problem in Two Pointers, Strings, or Binary Search
    const easyNext = unsolved.find(p => p.difficulty === 'Easy');
    if (easyNext) {
      return {
        problem: easyNext,
        reason: `Aapne ${solvedCount} foundational problems solve kar liye hain. Agla step ${easyNext.topics.join(' & ')} pattern ko master karna hai.`,
        confidence: 85,
        focusTopic: easyNext.topics[0],
      };
    }
  }

  // Next: Step up to Medium
  const mediumNext = unsolved.find(p => p.difficulty === 'Medium') || unsolved[0];
  return {
    problem: mediumNext,
    reason: `Aapka foundation strong ho chuka hai (${solvedCount} problems solved). Ab interview-level ${mediumNext.topics.join(' & ')} problems par move karne ka time hai.`,
    confidence: 89,
    focusTopic: mediumNext.topics[0],
  };
}
