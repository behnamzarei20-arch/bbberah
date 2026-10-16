-- Audit trail for primary-admin staff invitations and revocations.
-- Apply only after reviewing the complete admin hardening migration chain.
CREATE TABLE IF NOT EXISTS public.admin_staff_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('invite_created', 'invite_failed', 'staff_revoked')),
  target_email text,
  display_title text,
  permission_keys text[] NOT NULL DEFAULT ARRAY[]::text[],
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_staff_audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_staff_audit_log FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.admin_staff_audit_log TO service_role;

DROP POLICY IF EXISTS "primary_admin_read_staff_audit" ON public.admin_staff_audit_log;
CREATE POLICY "primary_admin_read_staff_audit"
  ON public.admin_staff_audit_log
  FOR SELECT TO authenticated
  USING (public.is_primary_admin());

-- Writes are intentionally service-role-only through the reviewed Edge Function.
GRANT SELECT ON public.admin_staff_audit_log TO authenticated;
