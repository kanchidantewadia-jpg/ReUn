-- First, drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all details" ON public.missing_persons;

-- Create new restrictive SELECT policy: only owners, admins, or moderators can see full details
CREATE POLICY "Owners and privileged users can view full details"
ON public.missing_persons
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'moderator'::app_role)
);

-- Ensure the authenticated_missing_persons view is the safe alternative for public access
-- (This view already exists and excludes contact information)