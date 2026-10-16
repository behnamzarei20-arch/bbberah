-- Close a privilege-escalation gap in the original self-insert profile policy.
-- A signed-in user may create only their own non-admin profile through the
-- client. The auth.users trigger creates the normal shipper profile separately.
-- Trusted provisioning of the primary administrator must happen through the
-- reviewed Supabase SQL/service-role process, never from the public client.

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;

CREATE POLICY "profiles_insert_self_non_admin"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role <> 'admin'
  );

-- Defense in depth: this trigger blocks client-originated attempts to insert an
-- admin profile even if a future permissive INSERT policy is added. The trusted
-- service role and the already-configured primary admin are explicit exceptions.
CREATE OR REPLACE FUNCTION public.guard_profile_admin_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.role = 'admin'
     AND COALESCE(auth.role(), '') <> 'service_role'
     AND NOT public.is_primary_admin() THEN
    RAISE EXCEPTION 'Administrator profiles require trusted provisioning'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_admin_insert ON public.profiles;
CREATE TRIGGER profiles_guard_admin_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_admin_insert();

REVOKE ALL ON FUNCTION public.guard_profile_admin_insert() FROM PUBLIC;
