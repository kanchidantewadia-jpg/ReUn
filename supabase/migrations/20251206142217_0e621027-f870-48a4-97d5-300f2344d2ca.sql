-- Fix messages table RLS: Restrict access to involved parties only
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;

CREATE POLICY "Involved parties can view messages" ON public.messages
FOR SELECT
USING (
  -- User is the message sender
  auth.uid() = sender_id
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