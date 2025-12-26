-- Create case_follows table for tracking which cases users are following
CREATE TABLE public.case_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  missing_person_id UUID NOT NULL REFERENCES public.missing_persons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, missing_person_id)
);

-- Enable Row Level Security
ALTER TABLE public.case_follows ENABLE ROW LEVEL SECURITY;

-- Create policies for case_follows
CREATE POLICY "Users can view their own follows"
ON public.case_follows
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can follow cases"
ON public.case_follows
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow cases"
ON public.case_follows
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for community_sightings so followers can get notified
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_sightings;