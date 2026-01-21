-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Update existing rows to set role based on is_admin
UPDATE profiles SET role = 'admin' WHERE is_admin = true;
UPDATE profiles SET role = 'user' WHERE is_admin = false OR is_admin IS NULL;
