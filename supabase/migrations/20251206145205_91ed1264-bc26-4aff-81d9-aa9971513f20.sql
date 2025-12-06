-- Fix cctv_footage table RLS: Restrict access to authorized users only
DROP POLICY IF EXISTS "Anyone can view CCTV footage" ON public.cctv_footage;

CREATE POLICY "Authorized users can view CCTV footage" ON public.cctv_footage
FOR SELECT
USING (
  -- User uploaded the footage
  auth.uid() = uploaded_by
  -- OR user owns the missing person report
  OR EXISTS (
    SELECT 1 FROM missing_persons mp
    WHERE mp.id = missing_person_id
    AND mp.user_id = auth.uid()
  )
  -- OR user is admin/moderator
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'moderator'::app_role)
);