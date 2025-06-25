
-- Create a revisions table to store document versions and changes
CREATE TABLE public.policy_revisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public."Policies"(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  field_name TEXT NOT NULL, -- 'purpose', 'policy_text', 'procedure', etc.
  original_content TEXT,
  modified_content TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('addition', 'deletion', 'modification')),
  change_metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_comment TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_policy_revisions_policy_id ON public.policy_revisions(policy_id);
CREATE INDEX idx_policy_revisions_status ON public.policy_revisions(status);
CREATE INDEX idx_policy_revisions_created_by ON public.policy_revisions(created_by);

-- Add Row Level Security (RLS)
ALTER TABLE public.policy_revisions ENABLE ROW LEVEL SECURITY;

-- Policy for viewing revisions - users can see revisions for policies they have access to
CREATE POLICY "Users can view policy revisions they have access to" 
  ON public.policy_revisions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public."Policies" p 
      WHERE p.id = policy_revisions.policy_id 
      AND (
        p.creator_id = auth.uid() OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('publish', 'super-admin')
      )
    )
  );

-- Policy for creating revisions - only editors can create revisions
CREATE POLICY "Editors can create policy revisions" 
  ON public.policy_revisions 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('edit', 'super-admin')
  );

-- Policy for updating revisions - only reviewers can update revision status
CREATE POLICY "Reviewers can update revision status" 
  ON public.policy_revisions 
  FOR UPDATE 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('publish', 'super-admin')
  );

-- Create a function to get the next revision number for a policy
CREATE OR REPLACE FUNCTION public.get_next_revision_number(p_policy_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(revision_number), 0) + 1
  INTO next_number
  FROM public.policy_revisions
  WHERE policy_id = p_policy_id;
  
  RETURN next_number;
END;
$$;
