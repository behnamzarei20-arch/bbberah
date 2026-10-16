-- Tighten staff read access to personal profiles and identity-document objects.
-- This migration is repository-only until a trusted operator applies it to a
-- separate test project and validates it. It does not alter the live database.

-- Staff should not receive unrestricted SELECT on profiles: that table includes
-- phone and other personal fields. Expose a deliberately limited directory RPC.
DROP POLICY IF EXISTS "admin_staff_read_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_staff_read_driver_profiles" ON public.driver_profiles;
DROP POLICY IF EXISTS "admin_staff_read_shipper_profiles" ON public.shipper_profiles;

CREATE OR REPLACE FUNCTION public.admin_staff_user_directory()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  role text,
  account_status text,
  city text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT p.id, p.full_name, p.role, p.status, p.city, p.created_at
  FROM public.profiles AS p
  WHERE public.has_admin_permission('users.read')
$$;

REVOKE ALL ON FUNCTION public.admin_staff_user_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_staff_user_directory() TO authenticated, service_role;

-- The function itself checks permission; do not expose sensitive driver/shipper
-- profile rows (national IDs, license numbers/images, company identifiers) to
-- staff through broad table SELECT policies. Existing owner/primary-admin
-- policies continue to apply to direct table reads.

-- A staff member with verification.read may fetch only documents explicitly
-- referenced by a verification submission, not every object in the bucket.
DROP POLICY IF EXISTS "admin_staff_read_identity_documents" ON storage.objects;
CREATE POLICY "admin_staff_read_identity_documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'identity-documents'
    AND public.has_admin_permission('verification.read')
    AND EXISTS (
      SELECT 1
      FROM public.identity_verification_submissions AS s
      WHERE s.identity_document_path = storage.objects.name
         OR s.face_photo_path = storage.objects.name
    )
  );

-- Deliberately leave participant/owner policies and the primary-admin policy
-- intact. PostgreSQL permissive policies combine with OR; this migration avoids
-- adding another broad staff table policy for personal-profile tables.
