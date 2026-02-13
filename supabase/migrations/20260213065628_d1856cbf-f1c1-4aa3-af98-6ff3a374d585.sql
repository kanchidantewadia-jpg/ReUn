
-- Create a trigger function to notify followers when a new sighting is reported
CREATE OR REPLACE FUNCTION public.notify_sighting_followers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Call the edge function to send email notifications to followers
  PERFORM net.http_post(
    url := current_setting('app.settings.api_url', true) || '/functions/v1/notify-sighting-followers',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'missingPersonId', NEW.missing_person_id,
      'sightingLocation', NEW.sighting_location,
      'sightingDescription', COALESCE(NEW.sighting_description, ''),
      'sightingDate', COALESCE(NEW.sighting_date::text, '')
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger on community_sightings for new inserts
CREATE TRIGGER notify_followers_on_new_sighting
AFTER INSERT ON public.community_sightings
FOR EACH ROW
EXECUTE FUNCTION public.notify_sighting_followers();
