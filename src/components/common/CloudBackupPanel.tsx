import React, { useEffect, useState } from 'react';
import AutoBackupControls from './AutoBackupControls';
import { disableAutoBackup } from '../../services/autoCloudBackup';
import { cloudAccount, cloudLogin, cloudLogout, cloudSignup } from '../../services/cloudAuth';
import { isSupabaseConfigured } from '../../services/supabaseConfig';
import { fetchCloudWorkspace, uploadCloudWorkspace, restoreCloudWorkspace, exportLocalBackup, type RemoteWorkspace } from '../../services/cloudWorkspace';

export default function CloudBackupPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [account, setAccount] = useState<string | null>(null);
  const [remote, setRemote] = useState<RemoteWorkspace | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) return;
    cloudAccount().then(user => setAccount(user?.email || user?.id || null))
      .catch(() => setAccount(null));
  }, [configured]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  const button = 'text-xs font-semibold px-3 py-2 rounded-lg border border-border-default bg-surface-3 text-text-primary disabled:opacity-50';

  return (
    <div className="bg-surface-2 border border-border-default rounded-[10px] p-5 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-text-primary">Supabase Cloud Backup</h4>
        <p className="text-xs text-text-tertiary mt-1">
          Optional manual backup for learning progress and code drafts. Your original local login is unchanged.
        </p>
      </div>
      {!configured ? (
        <p className="text-xs text-accent-yellow">Cloud backup is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your deployment.</p>
      ) : !account ? (
        <div className="space-y-3">
          <input aria-label="Cloud account email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Cloud email address" className="w-full p-2 rounded-lg bg-surface-3 text-text-primary text-sm border border-border-default" />
          <input aria-label="Cloud account password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Cloud password" className="w-full p-2 rounded-lg bg-surface-3 text-text-primary text-sm border border-border-default" />
          <div className="flex gap-2 flex-wrap">
            <button className={button} disabled={busy || !email || !password} onClick={() => run(async () => {
              disableAutoBackup();
              const user = await cloudLogin(email, password);
              setAccount(user.email || user.id);
              setPassword('');
              setRemote(await fetchCloudWorkspace());
              setMessage('Cloud sign-in successful.');
            })}>Sign in</button>
            <button className={button} disabled={busy || !email || !password} onClick={() => run(async () => {
              await cloudSignup(email, password);
              setPassword('');
              setMessage('Check your email for confirmation, then sign in.');
            })}>Create cloud account</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-text-secondary">Signed in as <strong>{account}</strong></p>
          <p className="text-xs text-text-tertiary">
            {remote ? 'Last cloud backup: ' + new Date(remote.updated_at).toLocaleString() : 'No cloud backup loaded yet.'}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className={button} disabled={busy} onClick={() => run(async () => {
              setRemote(await fetchCloudWorkspace());
              setMessage('Cloud backup status refreshed.');
            })}>Refresh</button>
            <button className={button} disabled={busy} onClick={() => run(async () => {
              const existing = await fetchCloudWorkspace();
              const warning = existing
                ? 'This will REPLACE your previous cloud backup. Keep a separate copy of important work. Continue?'
                : 'Upload a backup of your local learning progress, code drafts, and applications to your cloud account?';
              if (!window.confirm(warning)) return;
              disableAutoBackup();
              await uploadCloudWorkspace();
              setRemote(await fetchCloudWorkspace());
              setMessage('Cloud backup uploaded successfully.');
            })}>Backup to cloud</button>
            <button className={button} disabled={busy} onClick={() => run(async () => {
              const existing = await fetchCloudWorkspace();
              if (!existing) throw new Error('No cloud backup found for this account.');
              if (!window.confirm('Restore cloud progress to this device? This can overwrite selected local progress. A local JSON backup will be downloaded first.')) return;
              disableAutoBackup();
              restoreCloudWorkspace(existing.app_data);
            })}>Restore to this device</button>
            <button className={button} disabled={busy} onClick={() => run(async () => {
              disableAutoBackup();
              await cloudLogout();
              setAccount(null);
              setRemote(null);
              setPassword('');
              setMessage('Signed out of cloud backup.');
            })}>Cloud sign out</button>
          <AutoBackupControls />
          </div>
        </div>
      )}
      <button className={button} disabled={busy} onClick={exportLocalBackup}>Download local backup</button>
      {message && <p role="status" className="text-xs text-text-secondary">{message}</p>}
      <p className="text-xs text-text-tertiary">Manual and optional experimental upload-only backup; no automatic merging or cloud-to-device synchronization. Never upload credentials or secret keys.</p>
    </div>
  );
}
