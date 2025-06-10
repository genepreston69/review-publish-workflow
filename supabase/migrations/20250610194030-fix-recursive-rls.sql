
-- Fix infinite recursion in user_roles RLS policies by using security definer functions

-- Drop the existing policies that cause recursion
DROP POLICY IF EXISTS "Super admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Create new policies using the existing security definer function
-- Policy to allow super-admins to view all user roles
CREATE POLICY "Super admins can view all user roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.is_super_admin(auth.uid()));

-- Policy to allow super-admins to insert user roles
CREATE POLICY "Super admins can insert user roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Policy to allow super-admins to update user roles
CREATE POLICY "Super admins can update user roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (public.is_super_admin(auth.uid()));

-- Policy to allow super-admins to delete user roles
CREATE POLICY "Super admins can delete user roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (public.is_super_admin(auth.uid()));

-- Policy to allow users to view their own role
CREATE POLICY "Users can view their own role" 
  ON public.user_roles 
  FOR SELECT 
  USING (user_id = auth.uid());
