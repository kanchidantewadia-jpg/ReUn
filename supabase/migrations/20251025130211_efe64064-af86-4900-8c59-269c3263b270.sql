-- Update handle_new_user function to include display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, display_name, show_real_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'display_name', 'User' || substring(new.id::text from 1 for 8)),
    COALESCE((new.raw_user_meta_data->>'show_real_name')::boolean, false)
  );
  RETURN new;
END;
$function$;