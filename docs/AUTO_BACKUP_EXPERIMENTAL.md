# Safe automatic cloud backup (experimental)

This change intentionally does **not** unify the legacy local login with Supabase Auth. It adds an **opt-in, upload-only** auto-backup to the existing Settings → Data cloud account. Local progress remains available without Supabase.

## Setup
- Keep your existing Vercel `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` variables.
- The existing `public.user_workspace` table and RLS policy are reused; no new migration is needed.
- Login to the cloud backup account via Settings → Data.
- If local and cloud differ, explicitly choose a manual backup or restore first. Download the local JSON backup first.
- Select **Enable automatic backup**, and accept the confirmation prompt.

## Behavior
- Watches the existing two Zustand stores and uploads selected persisted data after 1.6 seconds of inactivity.
- The initial local and cloud snapshots must match; otherwise enabling auto backup refuses to proceed.
- The owner is bound to the existing Supabase Auth user UUID and current local profile ID.
- The server row's `updated_at` acts as an optimistic-concurrency revision. If another device changed it, the conditional update affects no rows and automatic backup stops with a conflict message.
- Local profile changes, Supabase account changes, and manual operations stop automatic backup.
- Temporary network errors stop/pause backup; local data is not discarded.
- User intent is stored locally and verified against Supabase on page load. No cloud backup is automatically downloaded.

## Important limits and tests before merging
- No real-time multi-device merging, no automatic restore, no unified login, and no background sync in closed tabs.
- Local-only credentials are not uploaded; existing local login is preserved.
- Test with **nonessential data** on a Preview deployment: backup, opt in, change coding draft, check Supabase row timestamp, open another device, modify the same backup, and verify a conflict prevents overwriting it.
- Test changing local profile and cloud sign-out stops sync; restart page to ensure resume only for matching accounts.
- Check that missing auth, wrong environment variables and no internet never erase local data.
- Confirm build succeeds, and test behavior in Electron and Android before Production merge.

### Planned next phase: single login
The legacy `authService.ts` stores local password hashes and `usr_...` IDs that are **not** Supabase Auth UUIDs. Replacing that service requires explicit ownership verification, account linking, user consent to import, local state partitioning on account change, and thorough data migration tests. Do not silently copy the old credentials or conflate two users. A separate PR will be needed.
