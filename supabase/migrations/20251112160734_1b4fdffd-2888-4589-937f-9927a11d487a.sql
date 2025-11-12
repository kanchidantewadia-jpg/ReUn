-- Add phone_number to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create trigger to send SMS notifications for child cases
CREATE OR REPLACE FUNCTION public.send_message_sms_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_owner_id UUID;
  report_owner_phone TEXT;
  report_owner_name TEXT;
  missing_person_name TEXT;
  is_child_case BOOLEAN;
  sms_notifications_enabled BOOLEAN;
BEGIN
  -- Get the report details
  SELECT mp.user_id, mp.full_name, mp.is_minor
  INTO report_owner_id, missing_person_name, is_child_case
  FROM missing_persons mp
  WHERE mp.id = NEW.missing_person_id;

  -- Only proceed for child cases
  IF is_child_case = true AND report_owner_id IS NOT NULL AND report_owner_id != NEW.sender_id THEN
    
    -- Get profile info including phone and SMS preferences
    SELECT p.phone_number, p.sms_notifications, p.full_name
    INTO report_owner_phone, sms_notifications_enabled, report_owner_name
    FROM profiles p
    WHERE p.user_id = report_owner_id;

    -- Send SMS if enabled and phone exists
    IF sms_notifications_enabled = true AND report_owner_phone IS NOT NULL THEN
      PERFORM net.http_post(
        url := current_setting('app.settings.api_url', true) || '/functions/v1/send-message-sms',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'recipientPhone', report_owner_phone,
          'recipientName', COALESCE(report_owner_name, 'Guardian'),
          'senderName', COALESCE(NEW.sender_name, 'Anonymous'),
          'messagePreview', SUBSTRING(NEW.message, 1, 100),
          'missingPersonName', missing_person_name,
          'missingPersonId', NEW.missing_person_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for SMS notifications on messages
DROP TRIGGER IF EXISTS send_sms_on_message ON public.messages;
CREATE TRIGGER send_sms_on_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.send_message_sms_notification();