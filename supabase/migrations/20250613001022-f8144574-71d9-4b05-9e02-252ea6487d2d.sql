
-- Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all profiles (needed for user management)
CREATE POLICY "Authenticated users can read profiles" ON public.profiles
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE 
    TO authenticated 
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Allow super admins to update any profile (for role changes)
CREATE POLICY "Super admins can update profiles" ON public.profiles
    FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'super-admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'super-admin'
        )
    );

-- Allow super admins to delete profiles
CREATE POLICY "Super admins can delete profiles" ON public.profiles
    FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'super-admin'
        )
    );

-- Allow authenticated users to insert profiles (for user creation)
CREATE POLICY "Authenticated users can insert profiles" ON public.profiles
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
