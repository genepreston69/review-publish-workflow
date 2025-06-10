
-- Drop all existing policies on Policies table first
DROP POLICY IF EXISTS "Users can view published policies" ON public."Policies";
DROP POLICY IF EXISTS "Editors and above can insert policies" ON public."Policies";
DROP POLICY IF EXISTS "Users can update their own policies or super-admins can update any" ON public."Policies";
DROP POLICY IF EXISTS "Super-admins can delete policies" ON public."Policies";
DROP POLICY IF EXISTS "Allow all authenticated users to view policies" ON public."Policies";
DROP POLICY IF EXISTS "Allow authenticated users to insert policies" ON public."Policies";
DROP POLICY IF EXISTS "Allow authenticated users to update policies" ON public."Policies";
DROP POLICY IF EXISTS "Allow authenticated users to delete policies" ON public."Policies";

-- Step 1: Create the app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('read-only', 'edit', 'publish', 'super-admin');
    END IF;
END $$;

-- Step 2: Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.app_role DEFAULT 'read-only' NOT NULL;

-- Step 3: Migrate existing user_roles data to profiles (only if user_roles table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        UPDATE public.profiles 
        SET role = ur.role::public.app_role
        FROM public.user_roles ur 
        WHERE profiles.id = ur.user_id;
    END IF;
END $$;

-- Step 4: Update the handle_new_user function to set default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  -- Create profile with matching ID and default role
  INSERT INTO public.profiles (id, name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    'read-only'::public.app_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  -- Create default notification preferences
  INSERT INTO public.notification_preferences (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 5: Create new simplified role check functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = $1 LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, check_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = $1 AND role = $2
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = $1 AND role = 'super-admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super-admin'
  );
$$;

-- Step 6: Create new policies using profile roles
CREATE POLICY "Users can view published policies" 
  ON public."Policies" 
  FOR SELECT 
  TO authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'super-admin') OR creator_id = auth.uid());

CREATE POLICY "Editors and above can insert policies" 
  ON public."Policies" 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'edit') OR public.has_role(auth.uid(), 'publish') OR public.has_role(auth.uid(), 'super-admin'));

CREATE POLICY "Users can update their own policies or super-admins can update any" 
  ON public."Policies" 
  FOR UPDATE 
  TO authenticated
  USING (creator_id = auth.uid() OR public.has_role(auth.uid(), 'super-admin') OR public.has_role(auth.uid(), 'publish'));

CREATE POLICY "Super-admins can delete policies" 
  ON public."Policies" 
  FOR DELETE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'super-admin'));

-- Step 7: Drop the old user_roles table and related functions (if they exist)
DROP TABLE IF EXISTS public.user_roles CASCADE;
