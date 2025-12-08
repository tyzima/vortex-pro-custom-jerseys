/*
  # Fix Profiles Email Constraint

  ## Changes
  - Remove UNIQUE constraint from email field in profiles table
  - The id field (linked to auth.users) is already unique and sufficient
  - Email uniqueness is already enforced by Supabase Auth

  ## Notes
  This prevents conflicts during profile creation since auth.users already
  ensures email uniqueness
*/

-- Drop the unique constraint on email if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_email_key;
  END IF;
END $$;