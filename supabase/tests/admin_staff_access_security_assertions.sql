-- Manual security assertions for the staff-access hardening migration.
-- Run ONLY against a disposable Supabase test project after applying migrations.
-- This script is read-only and raises an exception when a required guard is absent.

DO $$
DECLARE
  v_def text;
  v_count integer;
BEGIN
  -- The staff-only broad profile policies must not exist anymore.
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND policyname IN (
      'admin_staff_read_profiles',
      'admin_staff_read_driver_profiles',
      'admin_staff_read_shipper_profiles'
    );

  IF v_count <> 0 THEN
    RAISE EXCEPTION 'Broad staff profile policies still exist';
  END IF;

  -- The limited directory function must exist and must not return phone/avatar
  -- or identity-document fields.
  SELECT pg_get_functiondef(p.oid) INTO v_def
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'admin_staff_user_directory'
    AND p.pronargs = 0
  LIMIT 1;

  IF v_def IS NULL THEN
    RAISE EXCEPTION 'Limited staff directory function is missing';
  END IF;

  IF v_def ILIKE '%p.phone%' OR v_def ILIKE '%p.avatar_url%'
     OR v_def ILIKE '%national_id%' OR v_def ILIKE '%identity_document_path%' THEN
    RAISE EXCEPTION 'Limited staff directory exposes a sensitive field';
  END IF;

  -- Staff storage policy must be permission-gated and tied to a submitted path.
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'admin_staff_read_identity_documents'
    AND qual ILIKE '%has_admin_permission%'
    AND qual ILIKE '%identity_verification_submissions%';

  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Identity-document staff policy is missing or not path-scoped';
  END IF;

  -- Ensure the bucket remains private.
  SELECT count(*) INTO v_count
  FROM storage.buckets
  WHERE id = 'identity-documents'
    AND public = false;

  IF v_count <> 1 THEN
    RAISE EXCEPTION 'identity-documents bucket is missing or public';
  END IF;

  RAISE NOTICE 'Staff-access security assertions passed.';
END;
$$;
