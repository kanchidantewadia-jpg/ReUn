-- Create function to send email notification when message is created
CREATE OR REPLACE FUNCTION public.send_message_email_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_owner_id UUID;
  report_owner_email TEXT;
  report_owner_name TEXT;
  missing_person_name TEXT;
  email_notifications_enabled BOOLEAN;
BEGIN
  -- Get the report owner's user_id and email preferences
  SELECT mp.user_id, p.full_name, p.email_notifications, mp.full_name
  INTO report_owner_id, report_owner_name, email_notifications_enabled, missing_person_name
  FROM missing_persons mp
  LEFT JOIN profiles p ON p.user_id = mp.user_id
  WHERE mp.id = NEW.missing_person_id;

  -- Only send email if sender is NOT the report owner and email notifications are enabled
  IF report_owner_id IS NOT NULL 
     AND report_owner_id != NEW.sender_id 
     AND email_notifications_enabled = true THEN
    
    -- Get the report owner's email from auth.users
    SELECT email INTO report_owner_email
    FROM auth.users
    WHERE id = report_owner_id;

    -- If we have an email, invoke the edge function
    IF report_owner_email IS NOT NULL THEN
      PERFORM net.http_post(
        url := current_setting('app.settings.api_url', true) || '/functions/v1/send-message-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'recipientEmail', report_owner_email,
          'recipientName', COALESCE(report_owner_name, 'User'),
          'senderName', COALESCE(NEW.sender_name, 'Anonymous'),
          'messagePreview', SUBSTRING(NEW.message, 1, 150),
          'missingPersonName', missing_person_name,
          'missingPersonId', NEW.missing_person_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to send email on new message
DROP TRIGGER IF EXISTS on_new_message_send_email ON public.messages;
CREATE TRIGGER on_new_message_send_email
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.send_message_email_notification();