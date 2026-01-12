-- ==========================================
-- P2: SECURITY HARDENING (RLS & STORAGE)
-- ==========================================

-- 1. KB Proposed Taxonomy: Restrict to Session Owner
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.kb_proposed_taxonomy;
DROP POLICY IF EXISTS "Full access for authenticated" ON public.kb_proposed_taxonomy;

CREATE POLICY "Tutors can manage their own proposals"
    ON public.kb_proposed_taxonomy
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions s
            WHERE s.id = kb_proposed_taxonomy.session_id
            AND s.tutor_id = auth.uid()
        )
    );

-- 2. Storage: Recordings & Evidence Bucket Policies
-- Assuming 'recordings' bucket exists

-- Allow tutors to upload their own recordings/evidence
-- Paths are structured as: {tutor_id}/recordings/{filename} or {tutor_id}/evidence/{filename}
CREATE POLICY "Tutors can upload their own files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'recordings' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Tutors can view their own files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'recordings' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Tutors can delete their own files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'recordings' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
