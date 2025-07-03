
-- Update your profile to have super-admin role
UPDATE profiles 
SET role = 'super-admin' 
WHERE email = 'gpreston@recoverypointwv.org';

-- Add azure_id column if missing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS azure_id TEXT UNIQUE;

-- Link your Azure ID
UPDATE profiles 
SET azure_id = 'f4f76a78-8292-4d8b-b048-da59ecef07fd'
WHERE email = 'gpreston@recoverypointwv.org';
