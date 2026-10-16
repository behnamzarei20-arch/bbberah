-- Security hardening for Brah admin access.
-- Safe to apply only after reviewing and identifying the intended primary-admin UUID.
-- This migration does not create auth users or send invitations.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.admin_security_settings (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  primary_admin_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON TABLE private.admin_security_settings FROM PUBLIC, anon, authenticated;

-- No primary administrator is seeded automatically: an operator must set the
-- verified account UUID through the trusted Supabase SQL Editor/service role.
CREATE OR REPLACE FUNCTION public.is_primary_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM private.admin_security_settings s
    WHERE s.singleton = true
      AND s.primary_admin_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.is_primary_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_primary_admin() TO authenticated, service_role;

-- Explicit permission keys; unknown permissions are rejected by the table constraint.
CREATE TABLE IF NOT EXISTS public.admin_staff_permissions (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_title text NOT NULL CHECK (length(trim(display_title)) BETWEEN 2 AND 80),
  permissions text[] NOT NULL DEFAULT ARRAY[]::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_staff_permissions_allowed_keys CHECK (
    permissions <@ ARRAY[
      'dashboard.read',
      'users.read',
      'users.support',
      'loads.read',
      'loads.manage',
      'verification.read',
      'verification.review',
      'reports.read',
      'activity.read'
    ]::text[]
  )
);
ALTER TABLE public.admin_staff_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_staff_permissions_select_self_or_primary" ON public.admin_staff_permissions;
CREATE POLICY "admin_staff_permissions_select_self_or_primary"
  ON public.admin_staff_permissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_primary_admin());

DROP POLICY IF EXISTS "admin_staff_permissions_insert_primary_only" ON public.admin_staff_permissions;
CREATE POLICY "admin_staff_permissions_insert_primary_only"
  ON public.admin_staff_permissions FOR INSERT TO authenticated
  WITH CHECK (public.is_primary_admin() AND created_by = auth.uid());

DROP POLICY IF EXISTS "admin_staff_permissions_update_primary_only" ON public.admin_staff_permissions;
CREATE POLICY "admin_staff_permissions_update_primary_only"
  ON public.admin_staff_permissions FOR UPDATE TO authenticated
  USING (public.is_primary_admin())
  WITH CHECK (public.is_primary_admin());

DROP POLICY IF EXISTS "admin_staff_permissions_delete_primary_only" ON public.admin_staff_permissions;
CREATE POLICY "admin_staff_permissions_delete_primary_only"
  ON public.admin_staff_permissions FOR DELETE TO authenticated
  USING (public.is_primary_admin());

-- Permission checks for future/current server-side policies. Existing data-table
-- policies must explicitly call this function before assistants gain access.
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT CASE
    WHEN public.is_primary_admin() THEN true
    WHEN auth.uid() IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.admin_staff_permissions p
      WHERE p.user_id = auth.uid()
        AND p.is_active = true
        AND permission_key = ANY(p.permissions)
    )
  END;
$$;
REVOKE ALL ON FUNCTION public.has_admin_permission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_admin_permission(text) TO authenticated, service_role;

-- Never trust role supplied in sign-up metadata. New accounts are ordinary shippers.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone)
  VALUES (
    NEW.id,
    'shipper',
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

-- Role/status changes are restricted to the verified primary admin or trusted
-- service role. An authenticated user cannot promote themselves or others.
CREATE OR REPLACE FUNCTION public.guard_profile_privilege_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
BEGIN
  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status)
     AND COALESCE(auth.role(), '') <> 'service_role'
     AND NOT public.is_primary_admin() THEN
    RAISE EXCEPTION 'Only the primary administrator may change account role or status'
      USING ERRCODE = '42501';
  END IF;

  IF OLD.id = (
      SELECT s.primary_admin_id
      FROM private.admin_security_settings s
      WHERE s.singleton = true
    )
    AND NEW.role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'The primary administrator cannot be demoted through profile editing'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.role = 'admin'
     AND OLD.role IS DISTINCT FROM 'admin'
     AND COALESCE(auth.role(), '') <> 'service_role'
     AND NOT public.is_primary_admin() THEN
    RAISE EXCEPTION 'Administrator promotion requires trusted provisioning'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_privilege_changes ON public.profiles;
CREATE TRIGGER profiles_guard_privilege_changes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privilege_changes();

-- Table records permissions only; it deliberately does not create accounts or
-- provide authentication. Invitations must be implemented by a trusted backend
-- using Supabase Auth Admin APIs and one-time invite links.
