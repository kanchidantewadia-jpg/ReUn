-- Add verification, resolution, and emergency contact fields to missing_persons table
ALTER TABLE missing_persons 
ADD COLUMN verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN verified_by uuid REFERENCES auth.users(id),
ADD COLUMN verified_at timestamp with time zone,
ADD COLUMN verification_notes text,
ADD COLUMN is_resolved boolean DEFAULT false,
ADD COLUMN resolved_at timestamp with time zone,
ADD COLUMN resolution_notes text,
ADD COLUMN is_minor boolean DEFAULT false,
ADD COLUMN emergency_contact_name text,
ADD COLUMN emergency_contact_phone text,
ADD COLUMN emergency_contact_relation text;

-- Add comment explaining columns
COMMENT ON COLUMN missing_persons.verification_status IS 'Status of report verification by moderators/admins';
COMMENT ON COLUMN missing_persons.is_minor IS 'Flag indicating if the missing person is under 18';
COMMENT ON COLUMN missing_persons.is_resolved IS 'Flag indicating if the case has been resolved/closed';

-- Update RLS policies to allow report owners to update resolution status
CREATE POLICY "Report owners can mark as resolved"
ON missing_persons
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Only allow updating these specific fields
  (is_resolved IS DISTINCT FROM (SELECT is_resolved FROM missing_persons WHERE id = missing_persons.id) OR
   resolved_at IS DISTINCT FROM (SELECT resolved_at FROM missing_persons WHERE id = missing_persons.id) OR
   resolution_notes IS DISTINCT FROM (SELECT resolution_notes FROM missing_persons WHERE id = missing_persons.id))
);

-- Create index for faster verification queries
CREATE INDEX idx_missing_persons_verification ON missing_persons(verification_status);
CREATE INDEX idx_missing_persons_resolved ON missing_persons(is_resolved);