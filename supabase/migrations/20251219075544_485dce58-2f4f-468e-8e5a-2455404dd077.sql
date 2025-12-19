-- Create a function to search missing persons with full-text search and fuzzy matching
CREATE OR REPLACE FUNCTION public.search_missing_persons(
  search_text TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  min_age INTEGER DEFAULT NULL,
  max_age INTEGER DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL
)
RETURNS TABLE (
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
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  relevance REAL
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
    mp.created_at,
    mp.updated_at,
    CASE 
      WHEN search_text IS NULL OR search_text = '' THEN 1.0
      ELSE (
        -- Full-text search relevance
        COALESCE(
          ts_rank(
            to_tsvector('english', 
              COALESCE(mp.full_name, '') || ' ' || 
              COALESCE(mp.last_seen_location, '') || ' ' ||
              COALESCE(mp.clothing_description, '') || ' ' ||
              COALESCE(mp.distinguishing_features, '') || ' ' ||
              COALESCE(mp.additional_info, '')
            ),
            plainto_tsquery('english', search_text)
          ), 0
        ) +
        -- Trigram similarity for fuzzy matching on name
        COALESCE(similarity(mp.full_name, search_text), 0) * 2 +
        -- Trigram similarity for location
        COALESCE(similarity(mp.last_seen_location, search_text), 0) +
        -- Trigram similarity for features
        COALESCE(similarity(mp.distinguishing_features, search_text), 0) * 0.5 +
        -- Trigram similarity for clothing
        COALESCE(similarity(mp.clothing_description, search_text), 0) * 0.5
      )
    END::REAL as relevance
  FROM missing_persons mp
  WHERE 
    mp.visibility = 'public'
    -- Status filter
    AND (status_filter IS NULL OR mp.status::TEXT = status_filter)
    -- Age range filter
    AND (min_age IS NULL OR mp.age >= min_age)
    AND (max_age IS NULL OR mp.age <= max_age)
    -- Date range filter
    AND (date_from IS NULL OR mp.last_seen_date >= date_from)
    AND (date_to IS NULL OR mp.last_seen_date <= date_to)
    -- Text search (only if search text provided)
    AND (
      search_text IS NULL 
      OR search_text = ''
      -- Full-text search
      OR to_tsvector('english', 
          COALESCE(mp.full_name, '') || ' ' || 
          COALESCE(mp.last_seen_location, '') || ' ' ||
          COALESCE(mp.clothing_description, '') || ' ' ||
          COALESCE(mp.distinguishing_features, '') || ' ' ||
          COALESCE(mp.additional_info, '')
        ) @@ plainto_tsquery('english', search_text)
      -- Fuzzy match on name (handles typos)
      OR similarity(mp.full_name, search_text) > 0.2
      -- Fuzzy match on location
      OR similarity(mp.last_seen_location, search_text) > 0.2
      -- Fuzzy match on features
      OR similarity(mp.distinguishing_features, search_text) > 0.15
      -- Fuzzy match on clothing
      OR similarity(mp.clothing_description, search_text) > 0.15
      -- Partial match fallback (ILIKE)
      OR mp.full_name ILIKE '%' || search_text || '%'
      OR mp.last_seen_location ILIKE '%' || search_text || '%'
      OR mp.distinguishing_features ILIKE '%' || search_text || '%'
      OR mp.clothing_description ILIKE '%' || search_text || '%'
    )
  ORDER BY 
    relevance DESC,
    mp.created_at DESC;
END;
$$;

-- Enable pg_trgm extension for fuzzy matching (trigram similarity)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for faster full-text search
CREATE INDEX IF NOT EXISTS idx_missing_persons_fulltext 
ON missing_persons 
USING GIN (to_tsvector('english', 
  COALESCE(full_name, '') || ' ' || 
  COALESCE(last_seen_location, '') || ' ' ||
  COALESCE(clothing_description, '') || ' ' ||
  COALESCE(distinguishing_features, '') || ' ' ||
  COALESCE(additional_info, '')
));

-- Create trigram indexes for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_missing_persons_name_trgm 
ON missing_persons USING GIN (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_missing_persons_location_trgm 
ON missing_persons USING GIN (last_seen_location gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_missing_persons_features_trgm 
ON missing_persons USING GIN (distinguishing_features gin_trgm_ops);