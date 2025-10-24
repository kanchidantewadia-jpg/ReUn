-- Create enum for missing person status
CREATE TYPE public.missing_status AS ENUM ('missing', 'found', 'closed');

-- Create missing_persons table
CREATE TABLE public.missing_persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  last_seen_location TEXT NOT NULL,
  last_seen_date DATE NOT NULL,
  height TEXT,
  weight TEXT,
  clothing_description TEXT,
  distinguishing_features TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  additional_info TEXT,
  photo_url TEXT,
  status missing_status NOT NULL DEFAULT 'missing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.missing_persons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for missing_persons
CREATE POLICY "Anyone can view missing persons reports"
  ON public.missing_persons FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON public.missing_persons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON public.missing_persons FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  missing_person_id UUID NOT NULL REFERENCES public.missing_persons(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Anyone can view messages"
  ON public.messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Create cctv_footage table
CREATE TABLE public.cctv_footage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  missing_person_id UUID NOT NULL REFERENCES public.missing_persons(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  footage_url TEXT NOT NULL,
  location TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cctv_footage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cctv_footage
CREATE POLICY "Anyone can view CCTV footage"
  ON public.cctv_footage FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload footage"
  ON public.cctv_footage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- Create trigger for updated_at
CREATE TRIGGER update_missing_persons_updated_at
  BEFORE UPDATE ON public.missing_persons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('missing-persons-photos', 'missing-persons-photos', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('cctv-footage', 'cctv-footage', true);

-- Storage policies for missing-persons-photos
CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'missing-persons-photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'missing-persons-photos');

-- Storage policies for cctv-footage
CREATE POLICY "Anyone can view CCTV footage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cctv-footage');

CREATE POLICY "Authenticated users can upload CCTV footage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cctv-footage');

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;