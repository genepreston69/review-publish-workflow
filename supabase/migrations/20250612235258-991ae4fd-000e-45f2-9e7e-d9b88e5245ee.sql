
-- Create function to extract initials from a full name
CREATE OR REPLACE FUNCTION public.get_initials_from_name(full_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  words text[];
  initials text := '';
  word text;
BEGIN
  -- Handle null or empty input
  IF full_name IS NULL OR trim(full_name) = '' THEN
    RETURN 'UN';
  END IF;
  
  -- Split the name into words and get first letter of each
  words := string_to_array(trim(full_name), ' ');
  
  FOREACH word IN ARRAY words
  LOOP
    IF trim(word) != '' THEN
      initials := initials || upper(left(trim(word), 1));
    END IF;
  END LOOP;
  
  -- Ensure we have at least 1 character, max 3
  IF length(initials) = 0 THEN
    RETURN 'UN';
  ELSIF length(initials) > 3 THEN
    RETURN left(initials, 3);
  ELSE
    RETURN initials;
  END IF;
END;
$$;

-- Create function to extract initials from email
CREATE OR REPLACE FUNCTION public.get_initials_from_email(email_address text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  local_part text;
  initials text := '';
BEGIN
  -- Handle null or empty input
  IF email_address IS NULL OR trim(email_address) = '' THEN
    RETURN 'UN';
  END IF;
  
  -- Extract the local part (before @)
  local_part := split_part(email_address, '@', 1);
  
  -- If local part is empty, return default
  IF local_part IS NULL OR trim(local_part) = '' THEN
    RETURN 'UN';
  END IF;
  
  -- Take first 2 characters and uppercase them
  initials := upper(left(trim(local_part), 2));
  
  -- Ensure we have at least 1 character
  IF length(initials) = 0 THEN
    RETURN 'UN';
  ELSE
    RETURN initials;
  END IF;
END;
$$;
