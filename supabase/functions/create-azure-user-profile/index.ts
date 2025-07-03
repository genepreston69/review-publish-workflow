
CREATE OR REPLACE FUNCTION public.create_or_update_azure_user(user_email text, user_name text, user_role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_id uuid;
  user_initials text;
  result jsonb;
  existing_profile_id uuid;
BEGIN
  -- Generate initials from name
  user_initials := get_initials_from_name(user_name);
  
  -- Check if profile already exists by email
  SELECT id INTO existing_profile_id 
  FROM public.profiles 
  WHERE email = user_email;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Update existing profile
    UPDATE public.profiles 
    SET 
      name = user_name,
      role = user_role,
      initials = user_initials,
      updated_at = now()
    WHERE email = user_email
    RETURNING id INTO user_id;
    
    result := jsonb_build_object(
      'success', true,
      'user_id', user_id,
      'message', 'User profile updated successfully'
    );
  ELSE
    -- Create new profile with a new UUID (not linked to auth.users)
    user_id := gen_random_uuid();
    
    INSERT INTO public.profiles (id, email, name, role, initials)
    VALUES (user_id, user_email, user_name, user_role, user_initials);
    
    result := jsonb_build_object(
      'success', true,
      'user_id', user_id,
      'message', 'User profile created successfully'
    );
  END IF;
  
  RETURN result;
  
EXCEPTION 
  WHEN OTHERS THEN
    -- Return error result
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create/update user profile'
    );
    RETURN result;
END;
$$;
