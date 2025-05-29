
-- Add initials field to profiles table
ALTER TABLE public.profiles ADD COLUMN initials VARCHAR(10);

-- Update the handle_new_user function to auto-generate initials
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_initials TEXT;
BEGIN
  -- Extract initials from name or email
  IF NEW.raw_user_meta_data ->> 'name' IS NOT NULL THEN
    user_initials := get_initials_from_name(NEW.raw_user_meta_data ->> 'name');
  ELSE
    user_initials := get_initials_from_email(NEW.email);
  END IF;

  INSERT INTO public.profiles (id, name, email, initials)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    user_initials
  );
  
  -- Assign default 'read-only' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'read-only');
  
  RETURN NEW;
END;
$function$;

-- Helper function to extract initials from name
CREATE OR REPLACE FUNCTION public.get_initials_from_name(full_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
DECLARE
  words TEXT[];
  initials TEXT := '';
  word TEXT;
BEGIN
  -- Split name into words and take first letter of each
  words := string_to_array(trim(full_name), ' ');
  
  FOREACH word IN ARRAY words
  LOOP
    IF length(trim(word)) > 0 THEN
      initials := initials || upper(left(trim(word), 1));
    END IF;
  END LOOP;
  
  -- Limit to 3 characters maximum
  RETURN left(initials, 3);
END;
$function$;

-- Helper function to extract initials from email
CREATE OR REPLACE FUNCTION public.get_initials_from_email(email_address TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
DECLARE
  username TEXT;
  initials TEXT := '';
BEGIN
  -- Extract username part before @
  username := split_part(email_address, '@', 1);
  
  -- Take first two characters and uppercase
  initials := upper(left(username, 2));
  
  RETURN initials;
END;
$function$;

-- Update existing users to have initials
UPDATE public.profiles 
SET initials = CASE 
  WHEN name IS NOT NULL AND name != email THEN get_initials_from_name(name)
  ELSE get_initials_from_email(email)
END
WHERE initials IS NULL;
