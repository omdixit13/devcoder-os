/**
 * URL Validator & External Link Dispatcher for DevCareer OS
 * Ensures strict security: only allows http/https URLs and dispatches
 * to default system browser in Electron or safe target="_blank" in browser.
 */

export function isValidHttpUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (isValidHttpUrl(trimmed)) {
    return trimmed;
  }
  return null;
}

export async function openExternalUrl(rawUrl: string | undefined | null): Promise<boolean> {
  const validUrl = sanitizeUrl(rawUrl);
  if (!validUrl) {
    console.warn('[ExternalLink] Blocked attempt to open invalid URL:', rawUrl);
    return false;
  }

  try {
    // 1. Check if running in Electron environment
    if (typeof window !== 'undefined' && window.electronAPI?.openExternal) {
      const opened = await window.electronAPI.openExternal(validUrl);
      if (opened) return true;
    }

    // 2. Browser fallback
    if (typeof window !== 'undefined') {
      const win = window.open(validUrl, '_blank', 'noopener,noreferrer');
      if (win) {
        win.opener = null;
        return true;
      }
    }
  } catch (err) {
    console.error('[ExternalLink] Failed to open external URL:', validUrl, err);
  }

  return false;
}

/**
 * Extracts a clean username handle from either a username or a full profile URL
 */
export function extractHandle(input: string | undefined | null, platform: 'github' | 'leetcode'): string {
  if (!input) return '';
  let clean = input.trim();
  // Strip protocol and domain if full URL was pasted
  if (platform === 'github') {
    clean = clean.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
  } else if (platform === 'leetcode') {
    clean = clean.replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, '');
  }
  // Strip leading @, trailing slashes, or query params
  clean = clean.replace(/^@/, '').split('/')[0].split('?')[0].trim();
  return clean;
}

/**
 * Normalizes user input (either handle or URL) into a canonical external profile URL
 */
export function normalizeProfileUrl(input: string | undefined | null, platform: 'github' | 'leetcode'): string {
  const handle = extractHandle(input, platform);
  if (!handle) return '';
  if (platform === 'github') {
    return `https://github.com/${handle}`;
  }
  return `https://leetcode.com/u/${handle}`;
}

