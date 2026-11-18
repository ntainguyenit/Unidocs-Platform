-- Enable Row Level Security on public.access_logs to resolve rls_disabled_in_public error
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Revoke direct PostgREST privileges from public client roles for defense in depth
REVOKE ALL ON TABLE public.access_logs FROM anon, authenticated;

-- Drop existing policies so this migration remains safely idempotent
DROP POLICY IF EXISTS "Enable insert for service role only" ON public.access_logs;
DROP POLICY IF EXISTS "Enable read for service role only" ON public.access_logs;
DROP POLICY IF EXISTS "Enable update for service role only" ON public.access_logs;
DROP POLICY IF EXISTS "Enable delete for service role only" ON public.access_logs;

-- Allow only the backend service role to insert access log entries
CREATE POLICY "Enable insert for service role only"
ON public.access_logs
FOR INSERT
TO service_role
WITH CHECK ((SELECT auth.role()) = 'service_role');

-- Allow only the backend service role to read sensitive access log records
CREATE POLICY "Enable read for service role only"
ON public.access_logs
FOR SELECT
TO service_role
USING ((SELECT auth.role()) = 'service_role');

-- Allow only the backend service role to update access log records
CREATE POLICY "Enable update for service role only"
ON public.access_logs
FOR UPDATE
TO service_role
USING ((SELECT auth.role()) = 'service_role')
WITH CHECK ((SELECT auth.role()) = 'service_role');

-- Allow only the backend service role to delete expired access log records
CREATE POLICY "Enable delete for service role only"
ON public.access_logs
FOR DELETE
TO service_role
USING ((SELECT auth.role()) = 'service_role');
