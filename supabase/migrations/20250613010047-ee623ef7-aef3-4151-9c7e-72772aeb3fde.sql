
-- Add phone number column to profiles table for future TFA implementation
ALTER TABLE public.profiles 
ADD COLUMN phone_number TEXT;

-- Add a comment to document the purpose
COMMENT ON COLUMN public.profiles.phone_number IS 'User phone number for two-factor authentication';
