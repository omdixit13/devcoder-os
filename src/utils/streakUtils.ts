/**
 * Real Coding Streak & Activity Calculator
 * Strictly calculates streaks from real timestamps of user coding attempts and submissions.
 * Never fabricates numbers or returns placeholder values.
 */

export interface RealStreakData {
  currentStreak: number;
  longestStreak: number;
  activeToday: boolean;
  totalActiveDays: number;
}

export function calculateRealStreak(attemptTimestamps: string[]): RealStreakData {
  if (!attemptTimestamps || attemptTimestamps.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      activeToday: false,
      totalActiveDays: 0,
    };
  }

  // Extract unique sorted calendar date strings (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(
      attemptTimestamps
        .filter(t => Boolean(t))
        .map(t => {
          try {
            return new Date(t).toISOString().slice(0, 10);
          } catch {
            return null;
          }
        })
        .filter((d): d is string => d !== null)
    )
  ).sort();

  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      activeToday: false,
      totalActiveDays: 0,
    };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const activeToday = uniqueDates.includes(todayStr);

  // Calculate current streak backwards from today or yesterday
  let currentStreak = 0;
  let checkDate = new Date();
  if (!activeToday) {
    // If not yet active today, check if active yesterday to maintain ongoing streak
    if (uniqueDates.includes(yesterday)) {
      checkDate = new Date(Date.now() - 86400000);
    } else {
      checkDate = new Date(0); // Streak broken
    }
  }

  if (checkDate.getTime() > 0) {
    while (true) {
      const dateStr = checkDate.toISOString().slice(0, 10);
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr);
    if (!prevDate) {
      running = 1;
    } else {
      const diffDays = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    prevDate = d;
    if (running > longestStreak) longestStreak = running;
  }

  return {
    currentStreak,
    longestStreak,
    activeToday,
    totalActiveDays: uniqueDates.length,
  };
}
