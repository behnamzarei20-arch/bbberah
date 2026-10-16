-- Harden profile role assignment and prevent client-side privilege escalation.
-- Ordinary authenticated users may choose driver/shipper at signup, never admin.
-- Granting the admin role is an operational action performed with service-role credentials
-- or directly by a trusted database operator; never expose service-role credentials to clients.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  requested_role text;
BEGIN
  requested_role := CASE
    WHEN NEW.raw_user_meta_data ->> 'role' = 'driver' THEN 'driver'
    ELSE 'shipper'
  END;

  INSERT INTO public.profiles (id, role, full_name, phone)
  VALUES (
    NEW.id,
    requested_role,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_profile_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  request_role text := COALESCE(auth.role(), '');
  is_trusted_db_operator boolean := current_user IN ('postgres', 'supabase_admin');
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin'
       AND request_role <> 'service_role'
       AND NOT is_trusted_db_operator THEN
      RAISE EXCEPTION 'Admin role assignment requires a trusted operator'
        USING ERRCODE = '42501';
    END IF;

    IF auth.uid() IS NOT NULL AND auth.uid() <> NEW.id
       AND request_role <> 'service_role'
       AND NOT is_trusted_db_operator THEN
      RAISE EXCEPTION 'Cannot create a profile for another user'
        USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NEW.role = 'admin'
       AND request_role <> 'service_role'
       AND NOT is_trusted_db_operator THEN
      RAISE EXCEPTION 'Admin role assignment requires a trusted operator'
        USING ERRCODE = '42501';
    END IF;

    IF auth.uid() = OLD.id
       AND request_role <> 'service_role'
       AND NOT is_trusted_db_operator THEN
      RAISE EXCEPTION 'Users cannot change their own role'
        USING ERRCODE = '42501';
    END IF;

    IF request_role <> 'service_role'
       AND NOT is_trusted_db_operator
       AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only an administrator can change another user role'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_role_changes ON public.profiles;
CREATE TRIGGER profiles_guard_role_changes
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_role_changes();

-- SECURITY DEFINER helpers use a fixed search_path to avoid object-shadowing risks.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_current_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_role() TO authenticated;
