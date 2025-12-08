/*
  # Fix Profiles RLS Infinite Recursion

  ## Problem
  The "Admins can read all profiles" policy causes infinite recursion because it queries
  the profiles table while evaluating access to the profiles table, creating a circular reference.

  ## Solution
  1. Create a security definer function that bypasses RLS to safely check if a user is an admin
  2. Drop and recreate the admin policies using this function
  3. Apply the same fix to orders and design_templates policies that have the same issue

  ## Changes
  - Add `is_admin()` security definer function
  - Replace all admin-checking policies to use the new function
  - This breaks the recursion cycle by using a privileged function that bypasses RLS

  ## Security
  The security definer function is safe because:
  - It only returns a boolean (true/false)
  - It doesn't expose any profile data
  - It only checks the current user's own role
*/

-- Create a security definer function to check if current user is admin
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the problematic admin policy on profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Recreate it using the security definer function
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Fix orders policies
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Fix design_templates policies
DROP POLICY IF EXISTS "Admins can read all templates" ON design_templates;
CREATE POLICY "Admins can read all templates"
  ON design_templates FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can create templates" ON design_templates;
CREATE POLICY "Admins can create templates"
  ON design_templates FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update own templates" ON design_templates;
CREATE POLICY "Admins can update own templates"
  ON design_templates FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete own templates" ON design_templates;
CREATE POLICY "Admins can delete own templates"
  ON design_templates FOR DELETE
  TO authenticated
  USING (is_admin());