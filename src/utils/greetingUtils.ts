export interface TimeGreeting {
  title: string;
  salutation: string;
  subtitle: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  emoji: string;
}

/**
 * Returns dynamic, time-aware greetings matching the current hour of day
 */
export function getTimeGreeting(userName?: string): TimeGreeting {
  const hour = new Date().getHours();
  const name = userName?.trim();

  if (hour >= 4 && hour < 12) {
    return {
      salutation: 'GOOD MORNING',
      title: name ? `Good morning, ${name}` : 'Good morning',
      subtitle: 'Start your day with focus. Let’s get one useful thing done.',
      period: 'morning',
      emoji: '🌅',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      salutation: 'GOOD AFTERNOON',
      title: name ? `Good afternoon, ${name}` : 'Good afternoon',
      subtitle: 'Keep your momentum going. Ready for a targeted coding session?',
      period: 'afternoon',
      emoji: '☀️',
    };
  } else if (hour >= 17 && hour < 22) {
    return {
      salutation: 'GOOD EVENING',
      title: name ? `Good evening, ${name}` : 'Good evening',
      subtitle: 'Wrap up your daily revision and review today’s milestones.',
      period: 'evening',
      emoji: '🌆',
    };
  } else {
    // 22:00 (10 PM) to 03:59 AM
    return {
      salutation: 'LATE NIGHT HUSTLE',
      title: name ? `Working late, ${name}?` : 'Late night session',
      subtitle: 'Night owl mode active. Master your craft, but don’t forget to rest.',
      period: 'night',
      emoji: '🌙',
    };
  }
}
