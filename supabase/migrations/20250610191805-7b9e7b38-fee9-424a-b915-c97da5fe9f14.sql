
-- Phase 1: Database Schema Rebuild

-- Step 1: Drop existing problematic foreign key constraints
ALTER TABLE public.assignment_relations DROP CONSTRAINT IF EXISTS assignment_relations_edit_user_id_fkey;
ALTER TABLE public.assignment_relations DROP CONSTRAINT IF EXISTS assignment_relations_publish_user_id_fkey;
ALTER TABLE public.content DROP CONSTRAINT IF EXISTS content_assigned_publisher_id_fkey;
ALTER TABLE public.content DROP CONSTRAINT IF EXISTS content_author_id_fkey;
ALTER TABLE public."Policies" DROP CONSTRAINT IF EXISTS "Policies_creator_id_fkey";
ALTER TABLE public."Policies" DROP CONSTRAINT IF EXISTS "Policies_publisher_id_fkey";
ALTER TABLE public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Step 2: Update profiles table to ensure ID consistency
-- Add a constraint to ensure profiles.id always matches auth.users.id
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Update user_roles table to reference auth.users directly
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint to enforce one role per user
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Step 4: Recreate foreign keys to point to auth.users.id
ALTER TABLE public.assignment_relations ADD CONSTRAINT assignment_relations_edit_user_id_fkey 
  FOREIGN KEY (edit_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.assignment_relations ADD CONSTRAINT assignment_relations_publish_user_id_fkey 
  FOREIGN KEY (publish_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.content ADD CONSTRAINT content_assigned_publisher_id_fkey 
  FOREIGN KEY (assigned_publisher_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.content ADD CONSTRAINT content_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public."Policies" ADD CONSTRAINT "Policies_creator_id_fkey" 
  FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."Policies" ADD CONSTRAINT "Policies_publisher_id_fkey" 
  FOREIGN KEY (publisher_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.notification_preferences ADD CONSTRAINT notification_preferences_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Drop and recreate the handle_new_user function with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with matching ID
  INSERT INTO public.profiles (id, name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  -- Assign default 'read-only' role (only if no role exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'read-only')
  ON CONFLICT (user_id) DO NOTHING;
  
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

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
