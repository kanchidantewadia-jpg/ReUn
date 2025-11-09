-- Create security definer function to check if user can view contact info
CREATE OR REPLACE FUNCTION public.can_view_contact_info(_user_id uuid, _report_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- User is the report owner
    SELECT 1 FROM missing_persons 
    WHERE id = _report_id AND user_id = _user_id
  ) OR EXISTS (
    -- User is admin or moderator
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role IN ('admin', 'moderator')
  );
$$;

-- Enable realtime for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Create index for faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_missing_person_id ON public.messages(missing_person_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);