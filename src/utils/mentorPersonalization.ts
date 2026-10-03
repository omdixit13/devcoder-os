/**
 * Senior Mentor OM — Personalization & Dynamic Addressing Engine
 * Strictly enforces Spec Section 20, 21, and 22:
 *
 * 1. OM reads the authenticated user's actual profile (displayName, level, language, roadmap, mistakes).
 * 2. Ridhima-Only Affectionate Naming Rule:
 *    - If and ONLY IF the authenticated user's exact stored displayName is "Ridhima",
 *      OM is permitted to use preferred affectionate terms: "baby", "jaanu", "babu".
 *    - These are used naturally and sparingly (e.g. "Baby, pehle input aur output identify karte hain.").
 *    - For all other users, OM uses their verified first name or respectful neutral phrasing.
 *    - STRICT SECURITY: Never triggered by email, URL parameters, or spoofed frontend state.
 */

import { authService, type AuthUser } from '../services/authService';
import type { MentorAddressStyle } from '../types';

/**
 * Validates if the authenticated profile is strictly Ridhima
 */
export function isRidhimaProfile(user?: AuthUser | null): boolean {
  const activeUser = user !== undefined ? user : authService.getCurrentUser();
  if (!activeUser || !activeUser.displayName) return false;
  return activeUser.displayName.trim() === 'Ridhima';
}

/**
 * Returns the contextual mentor address term for the active user.
 */
export function getMentorAddress(
  user?: AuthUser | null,
  context: 'greeting' | 'hint' | 'observation' | 'encouragement' = 'greeting'
): string {
  const activeUser = user !== undefined ? user : authService.getCurrentUser();

  // 1. Strict Ridhima Rule Check
  if (isRidhimaProfile(activeUser)) {
    const style: MentorAddressStyle = activeUser?.mentorAddressStyle || 'baby';

    // If specific petname configured, use it; otherwise sparingly pick from approved terms
    if (style === 'baby') return 'Baby';
    if (style === 'jaanu') return 'Jaanu';
    if (style === 'babu') return 'Babu';

    const ridhimaTerms = ['Baby', 'Jaanu', 'Babu'];
    const idx = Math.floor(Math.random() * ridhimaTerms.length);
    return ridhimaTerms[idx];
  }

  // 2. Normal user: verified display name or neutral address
  if (activeUser?.displayName && activeUser.displayName.trim().length > 0 && activeUser.displayName !== 'Developer') {
    const firstName = activeUser.displayName.trim().split(' ')[0];
    return firstName;
  }

  return 'dost';
}

/**
 * Builds pedagogical hints adhering to Section 10 & 21 (natural Hinglish + personalized address).
 */
export function formatOmHintIntro(hintNumber: number, user?: AuthUser | null): string {
  const address = getMentorAddress(user, 'hint');
  const isRidhima = isRidhimaProfile(user);

  switch (hintNumber) {
    case 1:
      return isRidhima
        ? `${address}, pehle input aur output identify karte hain.`
        : `${address}, chaliye pehle input aur output format ko identify karte hain.`;
    case 2:
      return isRidhima
        ? `${address}, ek small observation hai — try kijiye.`
        : `${address}, constraints ko dhyan se dekhiye — ek key observation chhipi hai.`;
    case 3:
      return isRidhima
        ? `${address}, sochiye kaunsa pattern yahan fit baithega (Two Pointers ya Prefix Sum)?`
        : `${address}, sochiye kaunsi algorithmic technique yahan fit baithegi.`;
    case 4:
      return isRidhima
        ? `${address}, step-by-step approach banate hain.`
        : `${address}, step-by-step approach verify karte hain.`;
    case 5:
      return isRidhima
        ? `${address}, yeh raha structured pseudocode — ab execute karke dekhiye!`
        : `${address}, structured pseudocode dekhiye aur syntax connect kijiye.`;
    default:
      return `${address}, chaliye milke solve karte hain.`;
  }
}

/**
 * Builds error feedback strictly adhering to Section 11 (WHAT HAPPENED / WHY / HOW TO FIX).
 */
export function formatOmErrorFeedback(params: {
  errorType: string;
  errorMessage: string;
  user?: AuthUser | null;
}): { whatHappened: string; why: string; howToFix: string; address: string } {
  const { errorType, errorMessage, user } = params;
  const address = getMentorAddress(user, 'observation');

  if (errorMessage.includes('IndexError') || errorType === 'IndexError') {
    return {
      address,
      whatHappened: 'IndexError: Array boundary se bahar access hua.',
      why: 'Aapne list ke index ko uski maximum range (len - 1) se zyada ya negative access kiya.',
      howToFix: 'Loop termination condition check kijiye (use < n instead of <= n), aur empty list guards lagaiye.',
    };
  }

  if (errorMessage.includes('KeyError') || errorType === 'KeyError') {
    return {
      address,
      whatHappened: 'KeyError: Dictionary me non-existent key search hui.',
      why: 'Dictionary me wo key abhi insert nahi hui thi jab read karne ki koshish ki.',
      howToFix: 'Pehle "if key in dict:" check karein ya default value ke sath "dict.get(key, 0)" use karein.',
    };
  }

  if (errorMessage.includes('ZeroDivisionError') || errorType === 'ZeroDivisionError') {
    return {
      address,
      whatHappened: 'ZeroDivisionError: 0 se divide karne ki koshish hui.',
      why: 'Kisi step par denominator ki calculated value 0 ban gayi.',
      howToFix: 'Division se pehle condition check lagaiye: if denominator != 0.',
    };
  }

  if (errorMessage.includes('SyntaxError') || errorType === 'SyntaxError') {
    return {
      address,
      whatHappened: 'SyntaxError: Python grammar rule break hua.',
      why: 'Kahin par colon (:), indentation, ya brackets match nahi kar rahe hain.',
      howToFix: 'Error traceback me highlighted line number check karke colon ya matching brackets verify karein.',
    };
  }

  return {
    address,
    whatHappened: `${errorType || 'Runtime Exception'} occur hui.`,
    why: errorMessage || 'Execution runtime issue.',
    howToFix: 'Traceback inspect karein aur line variable states verify karein.',
  };
}
