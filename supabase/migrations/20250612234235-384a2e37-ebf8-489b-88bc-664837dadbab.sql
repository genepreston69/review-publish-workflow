
-- Step 1: Drop existing functions that conflict
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Step 2: Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN role app_role DEFAULT 'read-only' NOT NULL;

-- Step 3: Migrate existing role data from user_roles to profiles
-- Handle users with multiple roles by taking the highest priority role
UPDATE public.profiles 
SET role = (
  SELECT role 
  FROM public.user_roles 
  WHERE user_roles.user_id = profiles.id 
  ORDER BY 
    CASE role 
      WHEN 'super-admin' THEN 4
      WHEN 'publish' THEN 3
      WHEN 'edit' THEN 2
      WHEN 'read-only' THEN 1
      ELSE 0
    END DESC
  LIMIT 1
)
WHERE id IN (SELECT DISTINCT user_id FROM public.user_roles);

-- Step 4: Create new database functions to use profiles.role instead of user_roles
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, check_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = check_role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'super-admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super-admin'
  );
$$;

-- Step 5: Update the handle_new_user function to set role in profiles instead of user_roles
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
