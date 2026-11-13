import React, { useEffect, useState } from 'react';
import {
  disableAutoBackup, enableAutoBackup, getAutoBackupStatus,
  watchAutoBackup, type AutoBackupStatus
} from '../../services/autoCloudBackup';

/** Shown only when Supabase cloud user is signed in. */
export default function AutoBackupControls() {
  const [status, setStatus] = useState<AutoBackupStatus>(getAutoBackupStatus);
  const [busy, setBusy] = useState(false);
  useEffect(() => watchAutoBackup(setStatus), []);
  const isActive = status.phase === 'ready' || status.phase === 'saving' || status.phase === 'checking';

  return (
    <section className="border-t border-border-subtle pt-4 space-y-2">
      <h5 className="text-xs font-semibold text-text-primary">Automatic cloud backup (experimental)</h5>
      <p className="text-xs text-text-tertiary">
        Upload-only, after local changes. Requires your saved local data to match the current cloud
        backup before enabling. Other-device changes stop auto backup rather than silently replacing them.
        A separate cloud sign-in is still required.
      </p>
      <p className="text-xs text-text-secondary" role="status" aria-live="polite">
        {status.message}
      </p>
      <button
        className="text-xs font-semibold px-3 py-2 rounded-lg border border-border-default bg-surface-3 text-text-primary disabled:opacity-50"
        disabled={busy || status.phase === 'checking' || status.phase === 'saving'}
        onClick={async () => {
          if (isActive) { disableAutoBackup(); return; }
          if (!window.confirm('Enable automatic uploads to your Supabase cloud workspace? Local and cloud backups must match. Other-device changes can pause backup.')) return;
          setBusy(true);
          try { await enableAutoBackup(); }
          catch (error) { window.alert(error instanceof Error ? error.message : 'Unable to enable automatic backup.'); }
          finally { setBusy(false); }
        }}
      >
        {isActive ? 'Turn off automatic backup' : 'Enable automatic backup'}
      </button>
    </section>
  );
}
