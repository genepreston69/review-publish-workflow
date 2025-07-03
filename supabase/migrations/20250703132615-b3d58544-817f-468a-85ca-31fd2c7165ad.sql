
-- Add unique constraint on email column in profiles table
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
