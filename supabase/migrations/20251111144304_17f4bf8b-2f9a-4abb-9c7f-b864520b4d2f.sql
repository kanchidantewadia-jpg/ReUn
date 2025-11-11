-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  missing_person_id UUID NOT NULL,
  message_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  message_preview TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Create function to notify report owner of new messages
CREATE OR REPLACE FUNCTION public.notify_report_owner_of_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_owner_id UUID;
BEGIN
  -- Get the report owner's user_id
  SELECT user_id INTO report_owner_id
  FROM missing_persons
  WHERE id = NEW.missing_person_id;

  -- Only create notification if sender is NOT the report owner
  IF report_owner_id IS NOT NULL AND report_owner_id != NEW.sender_id THEN
    INSERT INTO public.notifications (
      user_id,
      missing_person_id,
      message_id,
      sender_name,
      message_preview,
      is_read
    ) VALUES (
      report_owner_id,
      NEW.missing_person_id,
      NEW.id,
      COALESCE(NEW.sender_name, 'Anonymous'),
      SUBSTRING(NEW.message, 1, 100),
      false
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to automatically create notifications
CREATE TRIGGER on_new_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_report_owner_of_message();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;