-- Create function for searching missing persons by location proximity
CREATE OR REPLACE FUNCTION public.search_missing_persons_nearby(
  user_lat NUMERIC,
  user_lng NUMERIC,
  radius_km NUMERIC DEFAULT 50,
  status_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  last_seen_location TEXT,
  last_seen_date DATE,
  status missing_status,
  photo_url TEXT,
  height TEXT,
  weight TEXT,
  clothing_description TEXT,
  distinguishing_features TEXT,
  additional_info TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  distance_km NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id,
    mp.full_name,
    mp.age,
    mp.gender,
    mp.last_seen_location,
    mp.last_seen_date,
    mp.status,
    mp.photo_url,
    mp.height,
    mp.weight,
    mp.clothing_description,
    mp.distinguishing_features,
    mp.additional_info,
    mp.latitude,
    mp.longitude,
    mp.created_at,
    mp.updated_at,
    -- Haversine formula to calculate distance in km
    (6371 * acos(
      cos(radians(user_lat)) * cos(radians(mp.latitude)) * 
      cos(radians(mp.longitude) - radians(user_lng)) + 
      sin(radians(user_lat)) * sin(radians(mp.latitude))
    ))::NUMERIC as distance_km
  FROM missing_persons mp
  WHERE 
    mp.visibility = 'public'
    AND mp.latitude IS NOT NULL
    AND mp.longitude IS NOT NULL
    -- Status filter
    AND (status_filter IS NULL OR mp.status::TEXT = status_filter)
    -- Distance filter using Haversine formula
    AND (6371 * acos(
      cos(radians(user_lat)) * cos(radians(mp.latitude)) * 
      cos(radians(mp.longitude) - radians(user_lng)) + 
      sin(radians(user_lat)) * sin(radians(mp.latitude))
    )) <= radius_km
  ORDER BY 
    distance_km ASC,
    mp.created_at DESC;
END;
$$;