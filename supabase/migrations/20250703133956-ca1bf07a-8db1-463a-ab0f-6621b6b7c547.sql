
-- First, let's check what depends on the profiles table and handle it properly
-- Drop the foreign key constraint from profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Drop foreign key constraints from other tables that reference profiles
ALTER TABLE public.assignment_relations DROP CONSTRAINT IF EXISTS assignment_relations_edit_user_id_fkey;
ALTER TABLE public.assignment_relations DROP CONSTRAINT IF EXISTS assignment_relations_publish_user_id_fkey;
ALTER TABLE public.content DROP CONSTRAINT IF EXISTS content_author_id_fkey;
ALTER TABLE public.content DROP CONSTRAINT IF EXISTS content_assigned_publisher_id_fkey;
ALTER TABLE public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.policy_comments DROP CONSTRAINT IF EXISTS policy_comments_user_id_fkey;
ALTER TABLE public.policy_revisions DROP CONSTRAINT IF EXISTS policy_revisions_created_by_fkey;
ALTER TABLE public.policy_revisions DROP CONSTRAINT IF EXISTS policy_revisions_reviewed_by_fkey;
ALTER TABLE public."Policies" DROP CONSTRAINT IF EXISTS "Policies_creator_id_fkey";
ALTER TABLE public."Policies" DROP CONSTRAINT IF EXISTS "Policies_publisher_id_fkey";
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Now we can safely drop and recreate the primary key
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- Recreate the foreign key constraints to reference profiles instead of auth.users
ALTER TABLE public.assignment_relations ADD CONSTRAINT assignment_relations_edit_user_id_fkey 
  FOREIGN KEY (edit_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.assignment_relations ADD CONSTRAINT assignment_relations_publish_user_id_fkey 
  FOREIGN KEY (publish_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.content ADD CONSTRAINT content_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.content ADD CONSTRAINT content_assigned_publisher_id_fkey 
  FOREIGN KEY (assigned_publisher_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.notification_preferences ADD CONSTRAINT notification_preferences_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.policy_comments ADD CONSTRAINT policy_comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.policy_revisions ADD CONSTRAINT policy_revisions_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.policy_revisions ADD CONSTRAINT policy_revisions_reviewed_by_fkey 
  FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public."Policies" ADD CONSTRAINT "Policies_creator_id_fkey" 
  FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public."Policies" ADD CONSTRAINT "Policies_publisher_id_fkey" 
  FOREIGN KEY (publisher_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
