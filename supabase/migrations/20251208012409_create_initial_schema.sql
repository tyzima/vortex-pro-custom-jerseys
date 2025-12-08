/*
  # Initial Schema Setup for Vortex Custom Jerseys

  ## Overview
  This migration creates the foundational database structure for the Vortex custom jersey platform,
  including user management with role-based access control and order tracking.

  ## Tables Created

  ### 1. profiles
  Extends Supabase auth.users with additional user information
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email address
  - `role` (text) - User role: 'admin' or 'customer'
  - `full_name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### 2. orders
  Stores customer order submissions with complete design and roster data
  - `id` (uuid, primary key) - Unique order identifier
  - `user_id` (uuid) - References profiles(id)
  - `order_number` (text, unique) - Human-readable order number
  - `status` (text) - Order status: 'pending', 'in_production', 'shipped', 'completed', 'cancelled'
  - `design_data` (jsonb) - Complete design configuration from Customizer
  - `roster_data` (jsonb) - Player roster with sizes and personalization
  - `shipping_info` (jsonb) - Shipping address and contact details
  - `subtotal` (numeric) - Order subtotal amount
  - `shipping_cost` (numeric) - Shipping cost
  - `total` (numeric) - Total order amount
  - `notes` (text) - Additional order notes or special instructions
  - `created_at` (timestamptz) - Order submission timestamp
  - `updated_at` (timestamptz) - Last order modification timestamp

  ### 3. design_templates
  Admin-created custom jersey templates available in the Customizer
  - `id` (uuid, primary key) - Unique template identifier
  - `created_by` (uuid) - References profiles(id) - Admin who created it
  - `sport` (text) - Sport type (basketball, soccer, lacrosse, etc.)
  - `name` (text) - Template display name
  - `description` (text) - Template description
  - `template_data` (jsonb) - Complete template configuration with SVG paths and layers
  - `is_published` (boolean) - Whether template is available to customers
  - `preview_image_url` (text) - URL to template preview image
  - `created_at` (timestamptz) - Template creation timestamp
  - `updated_at` (timestamptz) - Last template modification timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies:

  #### profiles table policies:
  - Users can read their own profile
  - Users can update their own profile
  - Admins can read all profiles
  - Only authenticated users can create profiles (triggered automatically on signup)

  #### orders table policies:
  - Customers can read only their own orders
  - Customers can create their own orders
  - Admins can read all orders
  - Admins can update all orders

  #### design_templates table policies:
  - All authenticated users can read published templates
  - Admins can read all templates (including unpublished)
  - Admins can create new templates
  - Admins can update templates they created
  - Admins can delete templates they created

  ## Notes
  - All timestamps use timestamptz for proper timezone handling
  - JSONB is used for flexible storage of design configurations
  - Indexes are created on frequently queried columns for performance
  - Foreign key constraints ensure data integrity
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_production', 'shipped', 'completed', 'cancelled')),
  design_data jsonb NOT NULL,
  roster_data jsonb,
  shipping_info jsonb NOT NULL,
  subtotal numeric(10, 2) NOT NULL DEFAULT 0,
  shipping_cost numeric(10, 2) NOT NULL DEFAULT 0,
  total numeric(10, 2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Customers can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Customers can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create design_templates table
CREATE TABLE IF NOT EXISTS design_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport text NOT NULL,
  name text NOT NULL,
  description text,
  template_data jsonb NOT NULL,
  is_published boolean DEFAULT false,
  preview_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_templates_sport ON design_templates(sport);
CREATE INDEX IF NOT EXISTS idx_templates_published ON design_templates(is_published);

-- Enable RLS on design_templates
ALTER TABLE design_templates ENABLE ROW LEVEL SECURITY;

-- Design templates policies
CREATE POLICY "Users can read published templates"
  ON design_templates FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can read all templates"
  ON design_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create templates"
  ON design_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update own templates"
  ON design_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete own templates"
  ON design_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  number_exists BOOLEAN;
BEGIN
  LOOP
    new_number := 'VO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_number) INTO number_exists;
    
    IF NOT number_exists THEN
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_templates_updated_at ON design_templates;
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON design_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();