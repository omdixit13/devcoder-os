import { cloudAccessToken, cloudAccount, supabaseRequest } from './cloudAuth';
import { createLocalSnapshot, fetchCloudWorkspace } from './cloudWorkspace';
import { authService } from './authService';

/**
 * Opt-in automatic CLOUD BACKUP (uploads only).
 * Never silently imports remote records or overwrites another device's newer save.
 * A separate Supabase login is still required until legacy identity migration.
 */
export type AutoBackupPhase = 'off' | 'checking' | 'ready' | 'saving' | 'conflict' | 'error';
export type AutoBackupStatus = { phase: AutoBackupPhase; message: string };
type SyncMarker = {
  userId: string;
  localUserId: string | null;
  revision: string;
  fingerprint: string;
};
const MARKER_KEY = 'devcoder_autobackup_v1';
const IDLE_MS = 1600;
const listeners = new Set<(status: AutoBackupStatus) => void>();
let status: AutoBackupStatus = { phase: 'off', message: 'Automatic backup is off.' };
let appUnsubscribe: (() => void) | null = null;
let labUnsubscribe: (() => void) | null = null;
let timeout: ReturnType<typeof setTimeout> | null = null;
let running = false;
let dirty = false;
let generation = 0;
let abortController: AbortController | null = null;

export function getAutoBackupStatus(): AutoBackupStatus { return status; }
export function watchAutoBackup(callback: (status: AutoBackupStatus) => void) {
  listeners.add(callback);
  callback(status);
  return () => { listeners.delete(callback); };
}
function report(phase: AutoBackupPhase, message: string) {
  status = { phase, message };
  listeners.forEach(listener => listener(status));
}
function readMarker(): SyncMarker | null {
  try {
    const raw = localStorage.getItem(MARKER_KEY);
    if (!raw) return null;
    const item = JSON.parse(raw) as SyncMarker;
    if (!item.userId || !item.revision || !item.fingerprint) return null;
    return item;
  } catch { return null; }
}
function saveMarker(value: SyncMarker) {
  localStorage.setItem(MARKER_KEY, JSON.stringify(value));
}

// Non-cryptographic change detection. This is not an authentication token.
function fingerprint(): string {
  const snapshot = createLocalSnapshot();
  const input = JSON.stringify([snapshot.app, snapshot.codingLab]);
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return input.length + ':' + (hash >>> 0).toString(16);
}

function disconnect(keepPreference: boolean) {
  generation++;
  if (timeout) clearTimeout(timeout);
  timeout = null;
  abortController?.abort();
  abortController = null;
  appUnsubscribe?.();
  labUnsubscribe?.();
  appUnsubscribe = null;
  labUnsubscribe = null;
  running = false;
  dirty = false;
  if (!keepPreference) localStorage.removeItem(MARKER_KEY);
}

/** Explicitly turn off sync on sign-out, account switch, or restore. */
export function disableAutoBackup() {
  disconnect(false);
  report('off', 'Automatic backup is off.');
}

async function commit(expected: SyncMarker, myGeneration: number) {
  if (myGeneration !== generation || !running) return;
  const newFingerprint = fingerprint();
  if (newFingerprint === expected.fingerprint) return;
  const currentLocalIdentity = authService.getCurrentUser()?.id || null;
  if (currentLocalIdentity !== expected.localUserId) {
    disconnect(false);
    report('conflict', 'Local profile changed. Auto backup stopped to protect account data.');
    return;
  }
  const user = await cloudAccount();
  if (!user || user.id !== expected.userId || myGeneration !== generation) {
    disconnect(false);
    report('conflict', 'Cloud account changed. Automatic backup stopped.');
    return;
  }
  const snapshot = createLocalSnapshot();
  const token = await cloudAccessToken();
  if (myGeneration !== generation) return;
  abortController = new AbortController();
  // Optimistic lock: only patch if updated_at still matches our known revision.
  const nextTimestamp = new Date(Math.max(Date.now(), Date.parse(expected.revision) + 1)).toISOString();
  const updated = await supabaseRequest<Array<{ updated_at: string }>>(
    '/rest/v1/user_workspace?select=updated_at&user_id=eq.' + encodeURIComponent(user.id)
      + '&updated_at=eq.' + encodeURIComponent(expected.revision),
    {
      method: 'PATCH',
      signal: abortController.signal,
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ app_data: snapshot, updated_at: nextTimestamp })
    }, token
  );
  abortController = null;
  if (myGeneration !== generation) return;
  if (updated.length !== 1) {
    disconnect(false);
    report('conflict', 'Cloud data changed on another device. Auto backup paused; choose a manual backup or restore.');
    return;
  }
  saveMarker({ ...expected, revision: updated[0].updated_at, fingerprint: newFingerprint });
  report('ready', 'Changes saved to Supabase.');
}

function queueSave() {
  if (!running) return;
  dirty = true;
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => { timeout = null; void flush(); }, IDLE_MS);
}

async function flush() {
  if (!running || !dirty) return;
  if (status.phase === 'saving') { dirty = true; return; }
  dirty = false;
  const marker = readMarker();
  if (!marker) { disableAutoBackup(); return; }
  const myGeneration = generation;
  try {
    report('saving', 'Saving latest progress to Supabase...');
    await commit(marker, myGeneration);
    if (myGeneration !== generation) return;
    if (status.phase === 'saving') report('ready', 'Cloud backup is up to date.');
    if (dirty) queueSave();
  } catch (error) {
    if (myGeneration !== generation) return;
    if (error instanceof Error && error.name === 'AbortError') return;
    disconnect(false);
    report('error', (error instanceof Error ? error.message : 'Cloud save failed.') + ' Auto backup stopped; your local progress is preserved.');
  }
}

async function attach(marker: SyncMarker): Promise<void> {
  disconnect(true);
  const myGeneration = generation;
  report('checking', 'Checking cloud version before enabling automatic backup...');
  try {
    const user = await cloudAccount();
    if (myGeneration !== generation) return;
    if (!user || user.id !== marker.userId) {
      disconnect(false);
      report('conflict', 'Cloud account does not match the account that enabled backup.');
      return;
    }
    if ((authService.getCurrentUser()?.id || null) !== marker.localUserId) {
      disconnect(false);
      report('conflict', 'Local profile changed since backup was enabled.');
      return;
    }
    const remote = await fetchCloudWorkspace();
    if (myGeneration !== generation) return;
    if (!remote || remote.updated_at !== marker.revision) {
      disconnect(false);
      report('conflict', 'Cloud backup changed or was removed. Review it manually before enabling auto backup again.');
      return;
    }
    const { useAppStore } = await import('../store/useAppStore');
    const { useCodingLabStore } = await import('../store/useCodingLabStore');
    if (myGeneration !== generation) return;
    appUnsubscribe = useAppStore.subscribe(queueSave);
    labUnsubscribe = useCodingLabStore.subscribe(queueSave);
    running = true;
    report('ready', 'Automatic backup is enabled for this cloud account.');
    if (fingerprint() !== marker.fingerprint) queueSave();
  } catch (error) {
    if (myGeneration !== generation) return;
    disconnect(true); // Keep the opt-in for retry after temporary offline failures.
    report('error', 'Cloud check failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Safe first opt-in: local and remote must already match.
 * User must explicitly do a manual Backup or Restore first if they differ.
 */
export async function enableAutoBackup(): Promise<void> {
  const user = await cloudAccount();
  if (!user) throw new Error('Sign in to Supabase before enabling automatic backup.');
  const remote = await fetchCloudWorkspace();
  if (!remote) throw new Error('Create your first manual cloud backup before enabling auto backup.');
  const local = createLocalSnapshot();
  if (JSON.stringify([local.app, local.codingLab])
      !== JSON.stringify([remote.app_data.app, remote.app_data.codingLab])) {
    throw new Error('Local and cloud data differ. First choose Backup to cloud or Restore to this device, then enable automatic backup.');
  }
  const marker: SyncMarker = {
    userId: user.id,
    localUserId: authService.getCurrentUser()?.id || null,
    revision: remote.updated_at,
    fingerprint: fingerprint()
  };
  saveMarker(marker);
  await attach(marker);
}

export async function resumeAutoBackup(): Promise<void> {
  const marker = readMarker();
  if (marker) await attach(marker);
}
