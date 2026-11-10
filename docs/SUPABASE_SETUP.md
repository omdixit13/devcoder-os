# Supabase database setup

## Security first
Rotate/revoke any exposed `sb_secret_` key under Supabase Dashboard → Project Settings → API Keys. Never commit secrets, put them into Vite environment variables, or share them in chat. Use only the project URL and publishable key in frontend code.

## Schema
`supabase/migrations/20261111000000_create_user_workspace.sql` creates a private workspace for each Supabase Auth user. Row Level Security protects records by matching `auth.uid()` to `user_id`. If the schema has already been manually created in SQL Editor, the migration is designed to reuse its table and replace the named policy. Do not run competing migration jobs.

## Client setup
1. Copy `.env.example` to `.env.local`, and enter the real project URL and publishable key. The existing `.gitignore` ignores `.env.local`.
2. Install the JS SDK using `npm install @supabase/supabase-js`, then commit both package files.
3. Create `src/services/supabaseClient.ts` using `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)` after checking that the variables exist.
4. Configure Auth Site URL and redirect URLs for web and desktop as necessary. Confirm email delivery settings before testing signup.

## Data migration safety
Current `src/services/authService.ts` uses localStorage for credentials, while Zustand stores `bholenath_os_store` and `devcareer_coding_lab` hold local user progress and code drafts. Local `usr_...` identifiers are NOT Supabase Auth UUIDs. Do not upload password hashes or entire localStorage. Existing users must authenticate with Supabase first, then explicitly import a carefully selected subset of local progress after verifying ownership. Preserve the old data until a successful save has been verified. Do not overwrite other users' workspaces when accounts change.

## Status
This PR installs the **database foundation only**. It does not replace production login, add SDK dependencies, sync data, or verify a live Supabase database. Implement those changes in a separate tested PR after the schema is deployed and credentials have been rotated.
