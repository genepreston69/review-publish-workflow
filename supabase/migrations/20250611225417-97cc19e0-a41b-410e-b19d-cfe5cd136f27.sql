
-- Create invitations table for user invitation system
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert invitations (for admins/super-admins)
CREATE POLICY "Authenticated users can create invitations" ON public.invitations
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Allow users to view invitations they created
CREATE POLICY "Users can view their own invitations" ON public.invitations
  FOR SELECT 
  TO authenticated 
  USING (invited_by = auth.uid());

-- Allow public access to invitations by token (for accepting invitations)
CREATE POLICY "Public can view invitations by token" ON public.invitations
  FOR SELECT 
  TO anon 
  USING (true);

-- Allow updating invitations to mark as accepted
CREATE POLICY "Public can update invitations to accept them" ON public.invitations
  FOR UPDATE 
  TO anon 
  USING (true);
