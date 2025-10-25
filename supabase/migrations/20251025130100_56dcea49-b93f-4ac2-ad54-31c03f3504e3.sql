-- Fix 1: Add anonymization features to profiles
ALTER TABLE profiles ADD COLUMN display_name TEXT;
ALTER TABLE profiles ADD COLUMN show_real_name BOOLEAN DEFAULT false;

-- Generate display names for existing users (Anonymous User #1, #2, etc.)
UPDATE profiles SET display_name = 'Anonymous User #' || substring(id::text from 1 for 8)
WHERE display_name IS NULL;

-- Make display_name NOT NULL after populating
ALTER TABLE profiles ALTER COLUMN display_name SET NOT NULL;

-- Fix 2: Add visibility controls to missing_persons
ALTER TABLE missing_persons ADD COLUMN visibility TEXT DEFAULT 'public';
ALTER TABLE missing_persons ADD CONSTRAINT visibility_check 
  CHECK (visibility IN ('public', 'authenticated', 'private'));

-- Fix 3: Create security definer function to get safe display names
CREATE OR REPLACE FUNCTION public.get_display_name(user_uuid UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT 
      CASE 
        WHEN show_real_name THEN full_name
        ELSE display_name
      END
    FROM profiles 
    WHERE user_id = user_uuid),
    'Anonymous User'
  );
$$;

-- Fix 4: Make sender_name nullable and prepare for deprecation
ALTER TABLE messages ALTER COLUMN sender_name DROP NOT NULL;
ALTER TABLE messages ALTER COLUMN sender_name SET DEFAULT NULL;

-- Fix 5: Update public_missing_persons view to respect visibility
DROP VIEW IF EXISTS public_missing_persons;

CREATE VIEW public_missing_persons WITH (security_invoker=true) AS
SELECT 
  id, full_name, age, gender, last_seen_location, last_seen_date,
  height, weight, clothing_description, distinguishing_features,
  additional_info, photo_url, status, created_at, updated_at
FROM missing_persons
WHERE visibility = 'public';

GRANT SELECT ON public_missing_persons TO anon;
GRANT SELECT ON public_missing_persons TO authenticated;

-- Fix 6: Create authenticated view for cases requiring login
CREATE VIEW authenticated_missing_persons WITH (security_invoker=true) AS
SELECT 
  id, full_name, age, gender, last_seen_location, last_seen_date,
  height, weight, clothing_description, distinguishing_features,
  additional_info, photo_url, status, created_at, updated_at
FROM missing_persons
WHERE visibility IN ('public', 'authenticated');

GRANT SELECT ON authenticated_missing_persons TO authenticated;