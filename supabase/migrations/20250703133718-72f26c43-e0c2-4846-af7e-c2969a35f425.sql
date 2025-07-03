
-- Remove the foreign key constraint from profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Also remove the primary key constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Recreate primary key without foreign key reference
ALTER TABLE public.profiles ADD PRIMARY KEY (id);
