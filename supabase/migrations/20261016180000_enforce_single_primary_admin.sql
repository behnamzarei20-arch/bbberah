-- Enforce the "one primary admin" model at the database layer.
-- This migration intentionally fails if legacy data already contains multiple
-- admin profiles; review and reconcile those accounts before retrying.

DO $$
BEGIN
  IF (SELECT count(*) FROM public.profiles WHERE role = 'admin') > 1 THEN
    RAISE EXCEPTION
      'Cannot enforce single administrator: multiple profiles currently have role=admin. Review these accounts before retrying.';
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_single_admin_role_idx
  ON public.profiles (role)
  WHERE role = 'admin';

-- Only the UUID configured as primary_admin_id may hold the admin role.
-- Trusted service-role provisioning must configure the UUID first, then promote
-- that exact profile. Assistants use admin_staff_permissions, never role=admin.
CREATE OR REPLACE FUNCTION public.guard_profile_privilege_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  configured_primary_admin uuid;
BEGIN
  SELECT s.primary_admin_id
    INTO configured_primary_admin
  FROM private.admin_security_settings s
  WHERE s.singleton = true;

  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status)
     AND COALESCE(auth.role(), '') <> 'service_role'
     AND NOT public.is_primary_admin() THEN
    RAISE EXCEPTION 'Only the primary administrator may change account role or status'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.role = 'admin'
     AND (
       configured_primary_admin IS NULL
       OR NEW.id IS DISTINCT FROM configured_primary_admin
     ) THEN
    RAISE EXCEPTION 'Only the configured primary administrator may hold the admin role'
      USING ERRCODE = '42501';
  END IF;

  IF OLD.id = configured_primary_admin
     AND NEW.role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'The primary administrator cannot be demoted through profile editing'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- Tighten the INSERT guard from the preceding migration as well: even service
-- role provisioning may create an admin profile only for the configured UUID.
CREATE OR REPLACE FUNCTION public.guard_profile_admin_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  configured_primary_admin uuid;
BEGIN
  IF NEW.role = 'admin' THEN
    SELECT s.primary_admin_id
      INTO configured_primary_admin
    FROM private.admin_security_settings s
    WHERE s.singleton = true;

    IF configured_primary_admin IS NULL
       OR NEW.id IS DISTINCT FROM configured_primary_admin THEN
      RAISE EXCEPTION 'Only the configured primary administrator may hold the admin role'
        USING ERRCODE = '42501';
    END IF;

    IF COALESCE(auth.role(), '') <> 'service_role'
       AND NOT public.is_primary_admin() THEN
      RAISE EXCEPTION 'Administrator profiles require trusted provisioning'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_profile_privilege_changes() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.guard_profile_admin_insert() FROM PUBLIC;
