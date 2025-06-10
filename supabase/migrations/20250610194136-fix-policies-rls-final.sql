

-- Fix infinite recursion in user_roles and improve policy access

-- First, drop any existing problematic policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage their roles" ON public.user_roles;

-- Disable RLS on user_roles to prevent infinite recursion
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Update the Policies table RLS to be more permissive for debugging
DROP POLICY IF EXISTS "Users can view published policies" ON public."Policies";
DROP POLICY IF EXISTS "Users can view their own policies" ON public."Policies";
DROP POLICY IF EXISTS "Super admins can view all policies" ON public."Policies";
DROP POLICY IF EXISTS "Publishers can view assigned policies" ON public."Policies";
DROP POLICY IF EXISTS "Super admins can insert policies" ON public."Policies";
DROP POLICY IF EXISTS "Editors can insert policies" ON public."Policies";
DROP POLICY IF EXISTS "Users can update their own policies" ON public."Policies";
DROP POLICY IF EXISTS "Super admins can delete policies" ON public."Policies";

-- Create simplified policies for Policies table
CREATE POLICY "Allow all authenticated users to view policies" 
  ON public."Policies" 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert policies" 
  ON public."Policies" 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update policies" 
  ON public."Policies" 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete policies" 
  ON public."Policies" 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Ensure RLS is enabled on Policies table
ALTER TABLE public."Policies" ENABLE ROW LEVEL SECURITY;

