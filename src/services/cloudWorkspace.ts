import { cloudAccessToken, cloudAccount, supabaseRequest } from './cloudAuth';

export interface WorkspaceSnapshot {
  version: 1;
  savedAt: string;
  app: Record<string, unknown>;
  codingLab: Record<string, unknown>;
}
export interface RemoteWorkspace {
  app_data: WorkspaceSnapshot;
  updated_at: string;
}

const APP_KEY = 'bholenath_os_store';
const LAB_KEY = 'devcareer_coding_lab';

// Only selected user data is uploaded; never credentials or other localStorage entries.
const APP_FIELDS = [
  'userName', 'githubProfileUrl', 'leetcodeProfileUrl', 'userRole', 'userCollege',
  'isProfileConnected', 'soundEnabled', 'soundVolume', 'reducedMotion',
  'concepts', 'skills', 'problems', 'applications', 'reviews', 'mistakes',
  'dailyStats', 'syncedSolutions', 'sirsSheetProblems', 'activeExamSession',
  'lastExamQuestionIds', 'savedTechNewsIds'
];
const LAB_FIELDS = ['currentLanguage', 'savedDrafts', 'attempts', 'mode'];

function readLocalState(key: string): Record<string, unknown> {
  const raw = localStorage.getItem(key);
  if (!raw) return {};
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || !('state' in parsed)) {
    throw new Error('Invalid local state for ' + key);
  }
  return (parsed as { state: Record<string, unknown> }).state;
}

function pick(source: Record<string, unknown>, keys: string[]) {
  return Object.fromEntries(keys.filter(key => Object.prototype.hasOwnProperty.call(source, key)).map(key => [key, source[key]]));
}

export function createLocalSnapshot(): WorkspaceSnapshot {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    app: pick(readLocalState(APP_KEY), APP_FIELDS),
    codingLab: pick(readLocalState(LAB_KEY), LAB_FIELDS)
  };
}

export async function fetchCloudWorkspace(): Promise<RemoteWorkspace | null> {
  const user = await cloudAccount();
  if (!user) throw new Error('Sign in to Supabase first.');
  const token = await cloudAccessToken();
  const result = await supabaseRequest<RemoteWorkspace[]>(
    '/rest/v1/user_workspace?select=app_data,updated_at&user_id=eq.' + encodeURIComponent(user.id),
    { method: 'GET' }, token
  );
  return result[0] || null;
}

export async function uploadCloudWorkspace(): Promise<void> {
  const user = await cloudAccount();
  if (!user) throw new Error('Sign in to Supabase first.');
  const token = await cloudAccessToken();
  const snapshot = createLocalSnapshot();
  await supabaseRequest(
    '/rest/v1/user_workspace?on_conflict=user_id',
    { method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        user_id: user.id,
        app_data: snapshot,
        updated_at: snapshot.savedAt
      })
    }, token
  );
}

function assertSnapshot(value: unknown): asserts value is WorkspaceSnapshot {
  if (!value || typeof value !== 'object') throw new Error('Invalid cloud backup.');
  const obj = value as Partial<WorkspaceSnapshot>;
  if (obj.version !== 1 || !obj.app || !obj.codingLab ||
      typeof obj.app !== 'object' || typeof obj.codingLab !== 'object' ||
      Array.isArray(obj.app) || Array.isArray(obj.codingLab)) {
    throw new Error('Unsupported cloud backup version.');
  }
}

export function exportLocalBackup(): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    [APP_KEY]: localStorage.getItem(APP_KEY),
    [LAB_KEY]: localStorage.getItem(LAB_KEY)
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'devcoder-local-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function writeSnapshot(key: string, next: Record<string, unknown>, allowed: string[]): void {
  const raw = localStorage.getItem(key);
  const previous = raw ? JSON.parse(raw) : {};
  const state = previous?.state && typeof previous.state === 'object' ? previous.state : {};
  localStorage.setItem(key, JSON.stringify({
    ...previous,
    state: { ...state, ...pick(next, allowed) }
  }));
}

// MUST be called only after an explicit user confirmation in the UI.
// Always export local data first, then reload to rehydrate both persisted stores.
export function restoreCloudWorkspace(snapshot: WorkspaceSnapshot): void {
  assertSnapshot(snapshot);
  exportLocalBackup();
  writeSnapshot(APP_KEY, snapshot.app, APP_FIELDS);
  writeSnapshot(LAB_KEY, snapshot.codingLab, LAB_FIELDS);
  window.location.reload();
}
