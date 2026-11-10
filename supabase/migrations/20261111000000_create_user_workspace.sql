CREATE TABLE IF NOT EXISTS public.user_workspace (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  app_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_workspace ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_workspace TO authenticated;
REVOKE ALL ON TABLE public.user_workspace FROM anon;
DROP POLICY IF EXISTS "Users access their own data" ON public.user_workspace;
CREATE POLICY "Users access their own data" ON public.user_workspace FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);
