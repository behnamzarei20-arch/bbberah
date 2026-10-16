-- Wire a first, deliberately read-only subset of assistant permissions.
-- Write/approval permissions are NOT granted by this migration. They need
-- separate, operation-specific policies and audit logging.
--
-- Apply only after the earlier admin-staff-permissions migrations have been
-- reviewed and the primary-admin UUID has been configured by a trusted operator.

-- Existing policies call is_admin(). Make that helper recognize only the
-- configured primary-admin identity, not any profile whose role text happens
-- to be 'admin'. The unique index migration also enforces one such profile.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT public.is_primary_admin();
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- Profiles: own-record access remains available via existing policies.
-- Assistant access is read-only and requires explicit users.read permission.
DROP POLICY IF EXISTS "admin_staff_read_profiles" ON public.profiles;
CREATE POLICY "admin_staff_read_profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_admin_permission('users.read'));

DROP POLICY IF EXISTS "admin_staff_read_driver_profiles" ON public.driver_profiles;
CREATE POLICY "admin_staff_read_driver_profiles"
  ON public.driver_profiles FOR SELECT TO authenticated
  USING (public.has_admin_permission('users.read'));

DROP POLICY IF EXISTS "admin_staff_read_shipper_profiles" ON public.shipper_profiles;
CREATE POLICY "admin_staff_read_shipper_profiles"
  ON public.shipper_profiles FOR SELECT TO authenticated
  USING (public.has_admin_permission('users.read'));

-- Logistics records: only assistants explicitly granted loads.read may browse
-- these records. Existing participant policies continue to govern normal users.
DROP POLICY IF EXISTS "admin_staff_read_cargo" ON public.cargo;
CREATE POLICY "admin_staff_read_cargo"
  ON public.cargo FOR SELECT TO authenticated
  USING (public.has_admin_permission('loads.read'));

DROP POLICY IF EXISTS "admin_staff_read_offers" ON public.offers;
CREATE POLICY "admin_staff_read_offers"
  ON public.offers FOR SELECT TO authenticated
  USING (public.has_admin_permission('loads.read'));

DROP POLICY IF EXISTS "admin_staff_read_shipments" ON public.shipments;
CREATE POLICY "admin_staff_read_shipments"
  ON public.shipments FOR SELECT TO authenticated
  USING (public.has_admin_permission('loads.read'));

DROP POLICY IF EXISTS "admin_staff_read_shipment_events" ON public.shipment_events;
CREATE POLICY "admin_staff_read_shipment_events"
  ON public.shipment_events FOR SELECT TO authenticated
  USING (public.has_admin_permission('loads.read'));

-- Identity verification: viewing submissions/events and downloading identity
-- documents are separately gated by verification.read. This grants no review,
-- approval, rejection, or mutation capability.
DROP POLICY IF EXISTS "admin_staff_read_identity_submissions" ON public.identity_verification_submissions;
CREATE POLICY "admin_staff_read_identity_submissions"
  ON public.identity_verification_submissions FOR SELECT TO authenticated
  USING (public.has_admin_permission('verification.read'));

DROP POLICY IF EXISTS "admin_staff_read_identity_events" ON public.identity_verification_events;
CREATE POLICY "admin_staff_read_identity_events"
  ON public.identity_verification_events FOR SELECT TO authenticated
  USING (public.has_admin_permission('verification.read'));

DROP POLICY IF EXISTS "admin_staff_read_identity_documents" ON storage.objects;
CREATE POLICY "admin_staff_read_identity_documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'identity-documents'
    AND public.has_admin_permission('verification.read')
  );

-- This migration intentionally does not enable users.support, loads.manage,
-- verification.review, reports.read, dashboard.read, or activity.read to
-- mutate or query additional tables. Those need a reviewed, explicit mapping.
