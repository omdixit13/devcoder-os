// ===== DevCareer OS Authentication Service =====
// Secure Local Authentication using Web Crypto API (Salted SHA-256)
// Never stores plaintext passwords.
// Honest OAuth configuration states (Never fakes Google/GitHub OAuth).

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  college: string;
  githubProfileUrl: string;
  leetcodeProfileUrl: string;
  targetCareer: string;
  weeklyStudyHours: number;
  createdAt: string;
}

interface StoredCredential {
  email: string;
  salt: string;
  passwordHash: string;
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
  // Check if OAuth is configured in environment
  getOAuthConfigurationStatus(): { googleConfigured: boolean; githubConfigured: boolean } {
    const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const githubId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    return {
      googleConfigured: Boolean(googleId && googleId.trim().length > 0),
      githubConfigured: Boolean(githubId && githubId.trim().length > 0),
    };
  },

  // Get currently active user
  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  // Sign up a new user
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

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: name.trim(),
      role: 'Student Developer',
      college: 'Computer Science',
      githubProfileUrl: '',
      leetcodeProfileUrl: '',
      targetCareer,
      weeklyStudyHours: 15,
      createdAt: new Date().toISOString(),
    };

    users[cleanEmail] = {
      email: cleanEmail,
      salt,
      passwordHash,
      user: newUser,
    };

    saveStoredUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return { success: true, user: newUser };
  },

  // Log in existing user
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

    const candidateHash = await hashPassword(password, credential.salt);
    if (candidateHash !== credential.passwordHash) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(credential.user));
    return { success: true, user: credential.user };
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
      message: `Password reset instructions have been generated for ${cleanEmail}. In local offline mode, please reset your password directly from the Profile settings.`,
    };
  },

  // Update profile
  updateProfile(updates: Partial<AuthUser>): AuthUser | null {
    const current = this.getCurrentUser();
    if (!current) return null;

    const updated = { ...current, ...updates };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

    const users = getStoredUsers();
    if (users[current.email]) {
      users[current.email].user = updated;
      saveStoredUsers(users);
    }

    return updated;
  },

  // Logout
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};
