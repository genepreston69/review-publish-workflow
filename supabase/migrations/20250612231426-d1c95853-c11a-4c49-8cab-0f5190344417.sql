
-- Check current RLS policies on Policies table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'Policies';

-- If no policies exist for INSERT, create them
-- Allow authenticated users to insert policies where they are the creator
CREATE POLICY "Users can insert policies as creator" ON "Policies"
    FOR INSERT 
    TO authenticated 
    WITH CHECK (creator_id = auth.uid());

-- Allow authenticated users to select policies
CREATE POLICY "Users can select policies" ON "Policies"
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Allow users to update policies they created or if they have proper roles
CREATE POLICY "Users can update their policies" ON "Policies"
    FOR UPDATE 
    TO authenticated 
    USING (creator_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super-admin', 'publish', 'edit')))
    WITH CHECK (creator_id = auth.uid() OR 
                EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super-admin', 'publish', 'edit')));

-- Allow super-admins to delete policies
CREATE POLICY "Super admins can delete policies" ON "Policies"
    FOR DELETE 
    TO authenticated 
    USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super-admin'));
