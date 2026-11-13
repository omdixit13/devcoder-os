# Supabase database and opt-in cloud backup

## Critical: rotate exposed credentials
If any `sb_secret_` API key was shared, revoke/rotate it at Supabase Dashboard → Project Settings → API Keys. **Never** commit it or put it in a `VITE_*` variable. Supabase publishable keys are designed for browser clients; RLS enforces row permissions.

## 1. Deploy database schema
Apply `supabase/migrations/20261111000000_create_user_workspace.sql` in the Supabase SQL Editor, or via a configured migration deployment. This creates a private `user_workspace` table keyed by Supabase Auth UUID and enables Row Level Security. If the original SQL-editor setup was already performed, this migration reuses the table and replaces the named policy.

The GitHub PR does not itself deploy tables into Supabase.

## 2. Configure client variables
Create `.env.local` using the keys in `.env.example`:
- `VITE_SUPABASE_URL`: project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: **publishable**, not secret API key

`.env.local` is already excluded from Git. For hosted Netlify builds, set the same two variables in the site's environment-variable settings and redeploy. Desktop/Android packages need their build-time environment configuration too. The implementation uses the official Supabase Auth/PostgREST HTTP endpoints, so no extra npm package is required.

## 3. Try cloud backup in the app
Start the app with `npm install` then `npm run dev`. Go to **Settings → Data → Supabase Cloud Backup**.

1. Create a separate Supabase cloud account with email and password. If email confirmation is enabled, verify email first. This account is **different from your existing local account**.
2. Sign in to the cloud account.
3. Use **Backup to cloud** to upload the allowlisted progress, coding drafts, app settings and application history (not passwords or other localStorage entries).
4. On another device, sign in to the same cloud account, then choose **Restore to this device**. A local JSON backup is downloaded first; selected local state is replaced and the app reloads.

This is an **opt-in/manual** backup service, *not* automatic sync. Uploading again replaces the previous cloud snapshot after confirmation. Restoring may replace selected local progress; back it up first. It does not migrate or unify the local email/password system, and does not sync unlisted data.

## 4. Verify
- Confirm the table exists and RLS is enabled in Supabase Table Editor.
- Test sign-up/login with a new account, including email confirmation.
- Upload a small test update and verify `user_workspace` has a row for that user's Auth UUID.
- Sign in as a second account and confirm it cannot read/update the first user's row.
- Test restore only with nonessential sample data first.
- Check build/tests and mobile/desktop behavior before merging the draft PR.

The GitHub branch has **not** been verified against the live database or built in CI. Keep the pull request as draft until those checks pass.
