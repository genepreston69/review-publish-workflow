
-- Create a table for policy comments
CREATE TABLE public.policy_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public."Policies"(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.policy_comments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view comments on policies they have access to
CREATE POLICY "Users can view policy comments they have access to" 
  ON public.policy_comments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public."Policies" p 
      WHERE p.id = policy_id 
      AND (
        p.creator_id = auth.uid() OR 
        p.publisher_id = auth.uid() OR
        p.reviewer = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('publish', 'super-admin'))
      )
    )
  );

-- Create policy that allows users to add comments to policies they have access to
CREATE POLICY "Users can create comments on policies they have access to" 
  ON public.policy_comments 
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public."Policies" p 
      WHERE p.id = policy_id 
      AND (
        p.creator_id = auth.uid() OR 
        p.publisher_id = auth.uid() OR
        p.reviewer = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('edit', 'publish', 'super-admin'))
      )
    )
  );

-- Create policy that allows users to update their own comments
CREATE POLICY "Users can update their own comments" 
  ON public.policy_comments 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Create policy that allows users to delete their own comments (and super-admins to delete any)
CREATE POLICY "Users can delete their own comments or super-admins can delete any" 
  ON public.policy_comments 
  FOR DELETE 
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super-admin')
  );

-- Create an index for better query performance
CREATE INDEX idx_policy_comments_policy_id ON public.policy_comments(policy_id);
CREATE INDEX idx_policy_comments_created_at ON public.policy_comments(created_at);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_policy_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_policy_comments_updated_at
    BEFORE UPDATE ON public.policy_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_policy_comments_updated_at();
