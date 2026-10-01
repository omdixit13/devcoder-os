export interface LeetCodeStats {
  username: string;
  realName: string;
  ranking: number;
  reputation: number;
  userAvatar: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  acceptanceRate: number;
  lastFetched: string;
}

const CACHE_KEY_PREFIX = 'leetcode_stats_cache_';
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes cache

export async function fetchUserLeetCodeStats(rawUsername: string): Promise<LeetCodeStats | null> {
  if (!rawUsername) return null;

  // Clean username if passed as a full URL
  const username = rawUsername
    .replace(/https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, '')
    .replace(/\/$/, '')
    .trim();

  if (!username) return null;

  // 1. Check local cache first
  const cacheKey = `${CACHE_KEY_PREFIX}${username.toLowerCase()}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const age = Date.now() - new Date(parsed.lastFetched).getTime();
      if (age < CACHE_TTL_MS) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore cache error
  }

  // GraphQL query
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
          userAvatar
          realName
        }
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
  `;

  let responseData: any = null;

  // Strategy A: Electron IPC (Direct native fetch, zero CORS)
  if (window.electronAPI?.fetchLeetCodeStats) {
    try {
      responseData = await window.electronAPI.fetchLeetCodeStats(username);
    } catch (err) {
      console.warn('Electron IPC fetchLeetCodeStats failed:', err);
    }
  }

  // Strategy B: Vite Proxy (/api/leetcode/graphql)
  if (!responseData?.data?.matchedUser) {
    try {
      const res = await fetch('/api/leetcode/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com'
        },
        body: JSON.stringify({ query, variables: { username } })
      });
      if (res.ok) {
        responseData = await res.json();
      }
    } catch (err) {
      // proxy failed or not in dev
    }
  }

  // Strategy C: Public Mirror APIs (alfa-leetcode-api or faisalshohag)
  if (!responseData?.data?.matchedUser) {
    try {
      const mirrorRes = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${username}`);
      if (mirrorRes.ok) {
        const mirrorJson = await mirrorRes.json();
        if (mirrorJson && (mirrorJson.totalSolved !== undefined || mirrorJson.matchedUser)) {
          const stats: LeetCodeStats = {
            username,
            realName: mirrorJson.name || mirrorJson.matchedUser?.profile?.realName || username,
            ranking: mirrorJson.ranking || mirrorJson.matchedUser?.profile?.ranking || 0,
            reputation: mirrorJson.reputation || 0,
            userAvatar: mirrorJson.avatar || mirrorJson.matchedUser?.profile?.userAvatar || '',
            totalSolved: mirrorJson.totalSolved ?? mirrorJson.matchedUser?.submitStats?.acSubmissionNum?.[0]?.count ?? 0,
            easySolved: mirrorJson.easySolved ?? mirrorJson.matchedUser?.submitStats?.acSubmissionNum?.[1]?.count ?? 0,
            mediumSolved: mirrorJson.mediumSolved ?? mirrorJson.matchedUser?.submitStats?.acSubmissionNum?.[2]?.count ?? 0,
            hardSolved: mirrorJson.hardSolved ?? mirrorJson.matchedUser?.submitStats?.acSubmissionNum?.[3]?.count ?? 0,
            totalSubmissions: mirrorJson.totalSubmissions?.[0]?.submissions ?? 0,
            acceptanceRate: mirrorJson.acceptanceRate ?? 0,
            lastFetched: new Date().toISOString()
          };
          localStorage.setItem(cacheKey, JSON.stringify(stats));
          return stats;
        }
      }
    } catch (err) {
      // mirror failed
    }
  }

  // Parse standard LeetCode GraphQL response
  const user = responseData?.data?.matchedUser;
  if (!user) {
    // If live fetch completely failed, check if we have older cached data
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  }

  const submitStats = user.submitStats?.acSubmissionNum || [];
  const allSub = submitStats.find((s: any) => s.difficulty === 'All') || { count: 0, submissions: 0 };
  const easySub = submitStats.find((s: any) => s.difficulty === 'Easy') || { count: 0 };
  const medSub = submitStats.find((s: any) => s.difficulty === 'Medium') || { count: 0 };
  const hardSub = submitStats.find((s: any) => s.difficulty === 'Hard') || { count: 0 };

  const acceptance = allSub.submissions > 0 
    ? Math.round((allSub.count / allSub.submissions) * 1000) / 10 
    : 0;

  const stats: LeetCodeStats = {
    username: user.username,
    realName: user.profile?.realName || user.username,
    ranking: user.profile?.ranking || 0,
    reputation: user.profile?.reputation || 0,
    userAvatar: user.profile?.userAvatar || '',
    totalSolved: allSub.count,
    easySolved: easySub.count,
    mediumSolved: medSub.count,
    hardSolved: hardSub.count,
    totalSubmissions: allSub.submissions,
    acceptanceRate: acceptance,
    lastFetched: new Date().toISOString()
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(stats));
  } catch (e) {}

  return stats;
}
