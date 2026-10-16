-- Manual identity verification MVP for Brah.
-- Sensitive images stay in private Supabase Storage; this table stores object paths,
-- the last four national-ID digits, and a keyed fingerprint produced by a trusted
-- server/Edge Function. Never store a raw national ID or document bytes here.
--
-- Client writes are intentionally disabled. A server-side submit function must
-- authenticate the caller, validate the uploaded object paths, compute the keyed
-- fingerprint with a server-only secret, and insert the submission using service role.
-- A server-side review function/admin dashboard must authorize status transitions.

CREATE TABLE IF NOT EXISTS public.identity_verification_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_role text NOT NULL CHECK (user_role IN ('driver', 'shipper')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'needs_correction', 'verified', 'rejected')),
  review_method text NOT NULL DEFAULT 'manual'
    CHECK (review_method IN ('manual', 'automatic')),
  -- Produced only on a trusted server using a secret HMAC key.
  national_id_fingerprint text,
  national_id_last4 char(4),
  identity_document_path text NOT NULL,
  face_photo_path text NOT NULL,
  reviewer_note text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT identity_verification_review_consistency CHECK (
    (status = 'pending' AND reviewed_at IS NULL AND reviewed_by IS NULL)
    OR
    (status <> 'pending' AND reviewed_at IS NOT NULL)
  )
);

ALTER TABLE public.identity_verification_submissions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_identity_verification_user_submitted
  ON public.identity_verification_submissions (user_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_identity_verification_queue
  ON public.identity_verification_submissions (status, submitted_at ASC);

-- Only one open manual review per account.
CREATE UNIQUE INDEX IF NOT EXISTS idx_identity_verification_one_pending_per_user
  ON public.identity_verification_submissions (user_id)
  WHERE status = 'pending';

-- One national identity fingerprint cannot have multiple active/approved accounts.
-- Null fingerprints are allowed until the trusted server submit function is configured.
CREATE UNIQUE INDEX IF NOT EXISTS idx_identity_verification_unique_national_id
  ON public.identity_verification_submissions (national_id_fingerprint)
  WHERE national_id_fingerprint IS NOT NULL AND status IN ('pending', 'verified');

DROP POLICY IF EXISTS "identity_verification_select_own_or_admin" ON public.identity_verification_submissions;
CREATE POLICY "identity_verification_select_own_or_admin"
  ON public.identity_verification_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- Intentionally no INSERT/UPDATE policy for regular users:
-- client-supplied "verified" values must never be trusted.
DROP POLICY IF EXISTS "identity_verification_admin_update" ON public.identity_verification_submissions;
CREATE POLICY "identity_verification_admin_update"
  ON public.identity_verification_submissions
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS identity_verification_updated_at ON public.identity_verification_submissions;
CREATE TRIGGER identity_verification_updated_at
  BEFORE UPDATE ON public.identity_verification_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Status-change audit trail; never copies the national ID, images, or private notes.
CREATE TABLE IF NOT EXISTS public.identity_verification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.identity_verification_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status_from text,
  status_to text NOT NULL CHECK (status_to IN ('pending', 'needs_correction', 'verified', 'rejected')),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.identity_verification_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_identity_verification_events_submission
  ON public.identity_verification_events (submission_id, created_at DESC);

DROP POLICY IF EXISTS "identity_verification_events_select_own_or_admin" ON public.identity_verification_events;
CREATE POLICY "identity_verification_events_select_own_or_admin"
  ON public.identity_verification_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE OR REPLACE FUNCTION public.audit_identity_verification_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.identity_verification_events (
      submission_id, user_id, status_from, status_to, actor_id
    ) VALUES (
      NEW.id,
      NEW.user_id,
      CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
      NEW.status,
      COALESCE(NEW.reviewed_by, auth.uid())
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS identity_verification_status_audit ON public.identity_verification_submissions;
CREATE TRIGGER identity_verification_status_audit
  AFTER INSERT OR UPDATE OF status ON public.identity_verification_submissions
  FOR EACH ROW EXECUTE FUNCTION public.audit_identity_verification_status();

-- Private storage for identity documents. Expected object paths:
-- <auth.uid()>/<submission-id>/identity-document.<ext>
-- <auth.uid()>/<submission-id>/face-photo.<ext>
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'identity-documents',
  'identity-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "identity_docs_upload_own_folder" ON storage.objects;
CREATE POLICY "identity_docs_upload_own_folder"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'identity-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "identity_docs_read_owner_or_admin" ON storage.objects;
CREATE POLICY "identity_docs_read_owner_or_admin"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'identity-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- Deliberately no public bucket or public read policy. Client-side/demo statuses
-- are not proof of identity; the application must consume server-authorized status.
