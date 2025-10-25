-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add face_match_confidence to cctv_footage for AI results
ALTER TABLE public.cctv_footage 
ADD COLUMN face_match_confidence NUMERIC(5,2),
ADD COLUMN matched_person_id UUID REFERENCES public.missing_persons(id);

-- Create index for faster admin queries
CREATE INDEX idx_missing_persons_user_id ON public.missing_persons(user_id);
CREATE INDEX idx_missing_persons_status ON public.missing_persons(status);
CREATE INDEX idx_cctv_footage_missing_person ON public.cctv_footage(missing_person_id);

-- Add notification preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN email_notifications BOOLEAN DEFAULT true,
ADD COLUMN sms_notifications BOOLEAN DEFAULT true;