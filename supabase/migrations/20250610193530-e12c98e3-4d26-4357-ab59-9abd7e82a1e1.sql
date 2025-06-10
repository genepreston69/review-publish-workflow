
-- Create RLS policies for user_roles table to allow super-admins to manage roles

-- Policy to allow super-admins to view all user roles
CREATE POLICY "Super admins can view all user roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'super-admin'
    )
  );

-- Policy to allow super-admins to insert user roles
CREATE POLICY "Super admins can insert user roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'super-admin'
    )
  );

-- Policy to allow super-admins to update user roles
CREATE POLICY "Super admins can update user roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'super-admin'
    )
  );

-- Policy to allow super-admins to delete user roles
CREATE POLICY "Super admins can delete user roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'super-admin'
    )
  );

-- Policy to allow users to view their own role
CREATE POLICY "Users can view their own role" 
  ON public.user_roles 
  FOR SELECT 
  USING (user_id = auth.uid());
