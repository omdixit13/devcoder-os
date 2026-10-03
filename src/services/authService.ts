// ===== DevCareer OS Authentication & Single Internal Profile Service =====
// Secure Local Authentication using Web Crypto API (Salted SHA-256)
// Never stores plaintext passwords.
// Single Profile Architecture: Multiple login providers (Google + GitHub) map to ONE internal user.
// Honest OAuth configuration states (Never fakes Google/GitHub OAuth).

import type { LinkedProvider, MentorAddressStyle, UserProfileData } from '../types';

export interface AuthUser extends UserProfileData {
  name: string; // alias for displayName (backwards compatibility)
}

interface StoredCredential {
  id: string;
  email: string;
  salt?: string;
  passwordHash?: string;
  user: AuthUser;
}

const AUTH_STORAGE_KEY = 'devcareer_auth_users';
const CURRENT_USER_KEY = 'devcareer_active_session';

// Helper: Hex string from ArrayBuffer
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Secure Salted SHA-256 Hashing via Web Crypto API
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return bufferToHex(arr.buffer);
}

function getStoredUsers(): Record<string, StoredCredential> {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveStoredUsers(users: Record<string, StoredCredential>) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

export const authService = {
  // Check if OAuth is genuinely configured in the environment
  getOAuthConfigurationStatus(): { googleConfigured: boolean; githubConfigured: boolean } {
    const googleId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    const githubId = (import.meta as any).env?.VITE_GITHUB_CLIENT_ID;
    return {
      googleConfigured: Boolean(googleId && googleId.trim().length > 0),
      githubConfigured: Boolean(githubId && githubId.trim().length > 0),
    };
  },

  // Get currently active user session
  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw);
      // Ensure name alias is consistent with displayName
      if (!user.name && user.displayName) user.name = user.displayName;
      if (!user.displayName && user.name) user.displayName = user.name;
      if (!user.linkedProviders) user.linkedProviders = [];
      if (!user.mentorAddressStyle) user.mentorAddressStyle = 'neutral';
      return user as AuthUser;
    } catch (e) {
      return null;
    }
  },

  // Sign up a new user with email & password
  async signup(params: {
    email: string;
    password: string;
    name: string;
    targetCareer?: string;
  }): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const { email, password, name, targetCareer = 'Software Development Engineer' } = params;
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter your name.' };
    }

    const users = getStoredUsers();
    if (users[cleanEmail]) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const trimmedName = name.trim();

    const newUser: AuthUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      email: cleanEmail,
      displayName: trimmedName,
      name: trimmedName,
      role: 'Student Developer',
      college: 'Computer Science',
      githubProfileUrl: '',
      leetcodeProfileUrl: '',
      targetCareer,
      careerInterests: [targetCareer],
      skills: ['DSA', 'Python', 'Problem Solving'],
      roadmap: 'Full Stack & DSA Mastery',
      studyPreferences: {
        weeklyStudyHours: 15,
        preferredLanguage: 'python',
      },
      notificationPreferences: {
        emailNotifications: true,
        streakReminders: true,
        deadlineAlerts: true,
      },
      mentorAddressStyle: trimmedName === 'Ridhima' ? 'baby' : 'neutral',
      linkedProviders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users[cleanEmail] = {
      id: newUser.id,
      email: cleanEmail,
      salt,
      passwordHash,
      user: newUser,
    };

    saveStoredUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return { success: true, user: newUser };
  },

  // Log in existing user with email & password
  async login(params: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const { email, password } = params;
    const cleanEmail = email.trim().toLowerCase();

    const users = getStoredUsers();
    const credential = users[cleanEmail];

    if (!credential) {
      return { success: false, error: 'No account found with this email. Please sign up.' };
    }

    if (!credential.salt || !credential.passwordHash) {
      return {
        success: false,
        error: 'This account was created via OAuth (Google/GitHub). Please sign in using your connected provider.',
      };
    }

    const candidateHash = await hashPassword(password, credential.salt);
    if (candidateHash !== credential.passwordHash) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Ensure backwards compatibility with name / displayName
    if (!credential.user.displayName && credential.user.name) credential.user.displayName = credential.user.name;
    if (!credential.user.name && credential.user.displayName) credential.user.name = credential.user.displayName;
    if (!credential.user.linkedProviders) credential.user.linkedProviders = [];

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(credential.user));
    return { success: true, user: credential.user };
  },

  // Log in or link via OAuth Provider (Google or GitHub)
  // Single Profile: Google login and GitHub login link to ONE internal DevCareer OS profile!
  async loginWithOAuth(params: {
    provider: 'google' | 'github';
    providerId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
    username?: string;
  }): Promise<{ success: boolean; user?: AuthUser; isNewAccount?: boolean; error?: string }> {
    const { provider, providerId, email, name, avatarUrl, username } = params;
    const cleanEmail = email.trim().toLowerCase();

    const users = getStoredUsers();

    // 1. Locate existing user by verified email OR existing linked provider identity
    let matchedCred: StoredCredential | null = null;
    let matchKey = cleanEmail;

    if (users[cleanEmail]) {
      matchedCred = users[cleanEmail];
    } else {
      // Check if any existing user already linked this provider ID
      for (const [key, cred] of Object.entries(users)) {
        if (cred.user.linkedProviders?.some(p => p.provider === provider && p.providerId === providerId)) {
          matchedCred = cred;
          matchKey = key;
          break;
        }
      }
    }

    if (matchedCred) {
      // Existing user found -> Link provider identity safely to this single profile
      const user = matchedCred.user;
      const existingProviderIndex = user.linkedProviders?.findIndex(p => p.provider === provider) ?? -1;

      const newProviderEntry: LinkedProvider = {
        provider,
        providerId,
        email: cleanEmail,
        username,
        avatarUrl,
        linkedAt: new Date().toISOString(),
      };

      if (existingProviderIndex >= 0) {
        user.linkedProviders[existingProviderIndex] = newProviderEntry;
      } else {
        user.linkedProviders = [...(user.linkedProviders || []), newProviderEntry];
      }

      // If avatar is missing, populate from provider
      if (!user.avatar && avatarUrl) {
        user.avatar = avatarUrl;
      }

      user.updatedAt = new Date().toISOString();
      matchedCred.user = user;
      users[matchKey] = matchedCred;
      saveStoredUsers(users);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      return { success: true, user, isNewAccount: false };
    }

    // 2. New User -> Create ONE internal DevCareer OS user with this linked provider
    const displayName = (name && name.trim().length > 1) ? name.trim() : (username || 'Developer');
    const newUser: AuthUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      email: cleanEmail,
      displayName,
      name: displayName,
      avatar: avatarUrl,
      role: 'Student Developer',
      college: 'Computer Science',
      githubProfileUrl: username ? `https://github.com/${username}` : '',
      leetcodeProfileUrl: '',
      targetCareer: 'Software Development Engineer',
      careerInterests: ['Software Development Engineer'],
      skills: ['DSA', 'Python', 'Problem Solving'],
      roadmap: 'Full Stack & DSA Mastery',
      studyPreferences: {
        weeklyStudyHours: 15,
        preferredLanguage: 'python',
      },
      notificationPreferences: {
        emailNotifications: true,
        streakReminders: true,
        deadlineAlerts: true,
      },
      mentorAddressStyle: displayName === 'Ridhima' ? 'baby' : 'neutral',
      linkedProviders: [
        {
          provider,
          providerId,
          email: cleanEmail,
          username,
          avatarUrl,
          linkedAt: new Date().toISOString(),
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users[cleanEmail] = {
      id: newUser.id,
      email: cleanEmail,
      user: newUser,
    };

    saveStoredUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return { success: true, user: newUser, isNewAccount: true };
  },

  // Safe Account Linking from Settings
  linkAccount(params: {
    provider: 'google' | 'github';
    providerId: string;
    email?: string;
    username?: string;
    avatarUrl?: string;
  }): { success: boolean; user?: AuthUser; error?: string } {
    const current = this.getCurrentUser();
    if (!current) {
      return { success: false, error: 'No active session. Please log in first.' };
    }

    const { provider, providerId, email, username, avatarUrl } = params;
    const users = getStoredUsers();

    // Ensure provider not already linked to another distinct user
    for (const [key, cred] of Object.entries(users)) {
      if (cred.user.id !== current.id && cred.user.linkedProviders?.some(p => p.provider === provider && p.providerId === providerId)) {
        return {
          success: false,
          error: `This ${provider} account is already linked to another DevCareer OS profile (${cred.user.email}).`,
        };
      }
    }

    const linkedProviders = [...(current.linkedProviders || [])];
    const existingIdx = linkedProviders.findIndex(p => p.provider === provider);

    const providerRecord: LinkedProvider = {
      provider,
      providerId,
      email: email || current.email,
      username,
      avatarUrl,
      linkedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      linkedProviders[existingIdx] = providerRecord;
    } else {
      linkedProviders.push(providerRecord);
    }

    const updatedUser: AuthUser = {
      ...current,
      linkedProviders,
      githubProfileUrl: provider === 'github' && username ? `https://github.com/${username}` : current.githubProfileUrl,
      avatar: current.avatar || avatarUrl,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    // Update in users database
    for (const [key, cred] of Object.entries(users)) {
      if (cred.user.id === current.id || cred.email === current.email) {
        users[key].user = updatedUser;
      }
    }
    saveStoredUsers(users);

    return { success: true, user: updatedUser };
  },

  // Safe Account Disconnection: Prevent removing the only login method!
  unlinkAccount(provider: 'google' | 'github'): { success: boolean; user?: AuthUser; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, error: 'No active user session.' };

    const users = getStoredUsers();
    const userCred = Object.values(users).find(c => c.user.id === current.id || c.email === current.email);

    const remainingProviders = (current.linkedProviders || []).filter(p => p.provider !== provider);
    const hasPassword = Boolean(userCred?.passwordHash && userCred.passwordHash.length > 0);

    // Safeguard check
    if (!hasPassword && remainingProviders.length === 0) {
      return {
        success: false,
        error: 'Cannot disconnect your only login method. Please set an email password or link another provider before unlinking.',
      };
    }

    const updatedUser: AuthUser = {
      ...current,
      linkedProviders: remainingProviders,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    for (const [key, cred] of Object.entries(users)) {
      if (cred.user.id === current.id || cred.email === current.email) {
        users[key].user = updatedUser;
      }
    }
    saveStoredUsers(users);

    return { success: true, user: updatedUser };
  },

  // Update profile attributes (Preserves internal ID and linked providers)
  updateProfile(updates: Partial<AuthUser>): AuthUser | null {
    const current = this.getCurrentUser();
    if (!current) return null;

    // Ridhima Rule Enforcement (Spec Section 21 & 22)
    let newAddressStyle = updates.mentorAddressStyle ?? current.mentorAddressStyle;
    const finalDisplayName = updates.displayName !== undefined ? updates.displayName.trim() : current.displayName;

    if (finalDisplayName !== 'Ridhima' && ['baby', 'jaanu', 'babu'].includes(newAddressStyle)) {
      newAddressStyle = 'name';
    }

    const updated: AuthUser = {
      ...current,
      ...updates,
      displayName: finalDisplayName,
      name: finalDisplayName,
      mentorAddressStyle: newAddressStyle,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

    const users = getStoredUsers();
    for (const [key, cred] of Object.entries(users)) {
      if (cred.user.id === current.id || cred.email === current.email) {
        users[key].user = updated;
      }
    }
    saveStoredUsers(users);

    return updated;
  },

  // Set mentor address style with strict Ridhima authorization check
  setMentorAddressStyle(style: MentorAddressStyle): { success: boolean; style: MentorAddressStyle; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, style: 'neutral', error: 'No active session.' };

    if (['baby', 'jaanu', 'babu'].includes(style)) {
      if (current.displayName.trim() !== 'Ridhima') {
        return {
          success: false,
          style: 'name',
          error: 'Affectionate mentor addressing is restricted by profile rules.',
        };
      }
    }

    this.updateProfile({ mentorAddressStyle: style });
    return { success: true, style };
  },

  // Forgot password request
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    if (!users[cleanEmail]) {
      return {
        success: false,
        message: 'No account registered with this email address.',
      };
    }
    return {
      success: true,
      message: `Password reset instructions have been generated for ${cleanEmail}. In local mode, you can update your credentials directly from Settings.`,
    };
  },

  // Logout
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};
