
-- Add RLS policies for the Policies table to allow proper access

-- Policy to allow all authenticated users to view published policies
CREATE POLICY "Users can view published policies" 
  ON public."Policies" 
  FOR SELECT 
  USING (status = 'published');

-- Policy to allow creators to view their own policies
CREATE POLICY "Users can view their own policies" 
  ON public."Policies" 
  FOR SELECT 
  USING (creator_id = auth.uid());

-- Policy to allow super-admins to view all policies
CREATE POLICY "Super admins can view all policies" 
  ON public."Policies" 
  FOR SELECT 
  USING (public.is_super_admin(auth.uid()));

-- Policy to allow publishers to view policies assigned to them
CREATE POLICY "Publishers can view assigned policies" 
  ON public."Policies" 
  FOR SELECT 
  USING (publisher_id = auth.uid() OR reviewer = (
    SELECT email FROM public.profiles WHERE id = auth.uid()
  ));

-- Policy to allow super-admins to insert policies
CREATE POLICY "Super admins can insert policies" 
  ON public."Policies" 
  FOR INSERT 
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Policy to allow editors to insert policies
CREATE POLICY "Editors can insert policies" 
  ON public."Policies" 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('edit', 'publish', 'super-admin')
    )
  );

-- Policy to allow creators and super-admins to update their policies
CREATE POLICY "Users can update their own policies" 
  ON public."Policies" 
  FOR UPDATE 
  USING (creator_id = auth.uid() OR public.is_super_admin(auth.uid()));

-- Policy to allow super-admins to delete any policy
CREATE POLICY "Super admins can delete policies" 
  ON public."Policies" 
  FOR DELETE 
  USING (public.is_super_admin(auth.uid()));

-- Enable RLS on the Policies table if not already enabled
ALTER TABLE public."Policies" ENABLE ROW LEVEL SECURITY;
