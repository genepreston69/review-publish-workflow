
-- Add the missing initials column to the profiles table
ALTER TABLE public.profiles ADD COLUMN initials TEXT;

-- Update the handle_new_user function to properly handle the initials column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_initials TEXT;
BEGIN
  -- Extract initials from name or email
  IF NEW.raw_user_meta_data ->> 'name' IS NOT NULL THEN
    user_initials := get_initials_from_name(NEW.raw_user_meta_data ->> 'name');
  ELSE
    user_initials := get_initials_from_email(NEW.email);
  END IF;

  INSERT INTO public.profiles (id, name, email, initials, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    user_initials,
    'read-only'
  );
  
  RETURN NEW;
END;
$$;
