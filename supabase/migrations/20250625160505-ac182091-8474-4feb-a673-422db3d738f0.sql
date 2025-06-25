
-- Check existing policies on Forms table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'Forms';

-- Add RLS policies for Forms table to allow authenticated users to insert, select, update, and delete
-- Policy for SELECT (read access)
CREATE POLICY "Users can view all forms" ON "Forms"
FOR SELECT
TO authenticated
USING (true);

-- Policy for INSERT (create access)
CREATE POLICY "Users can create forms" ON "Forms"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for UPDATE (edit access)
CREATE POLICY "Users can update forms" ON "Forms"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for DELETE (delete access) - typically restricted to super-admin
CREATE POLICY "Super admins can delete forms" ON "Forms"
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'super-admin'
  )
);

-- Enable RLS on the Forms table if not already enabled
ALTER TABLE "Forms" ENABLE ROW LEVEL SECURITY;
