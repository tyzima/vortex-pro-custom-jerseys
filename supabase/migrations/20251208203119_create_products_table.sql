/*
  # Create Products Table

  This migration creates a standalone products table where each product is a first-class entity.

  ## New Table: `products`
  - `id` (uuid, primary key)
  - `sport_id` (uuid) - References sports table
  - `name` (text) - Product display name (e.g., "Men's Pro Jersey")
  - `slug` (text) - URL-friendly identifier
  - `product_type` (text) - Type of garment (jersey, shorts, pants, hoodie, etc.)
  - `gender` (text) - Target gender/fit (mens, womens, youth, unisex)
  - `description` (text) - Product description
  - `base_price` (numeric) - Base price per unit
  - `min_quantity` (integer) - Minimum order quantity
  - `production_time` (text) - Estimated production time
  - `features` (jsonb) - Array of feature strings
  - `is_active` (boolean) - Whether product is available
  - `display_order` (integer) - Sort order
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## New Table: `product_shapes`
  Stores SVG paths for product shapes (front/back views)
  - `id` (uuid, primary key)
  - `product_id` (uuid) - References products table
  - `side` (text) - 'front' or 'back'
  - `shape_path` (text) - Main shape SVG path
  - `trim_path` (text) - Optional trim SVG path
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all new tables
  - Public read access for active products
  - Admin-only write access
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  product_type text NOT NULL DEFAULT 'jersey',
  gender text NOT NULL DEFAULT 'unisex',
  description text DEFAULT '',
  base_price numeric(10,2) DEFAULT 49.99,
  min_quantity integer DEFAULT 1,
  production_time text DEFAULT '2-3 weeks',
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sport_id, slug)
);

-- Create product_shapes table
CREATE TABLE IF NOT EXISTS product_shapes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  side text NOT NULL CHECK (side IN ('front', 'back')),
  shape_path text NOT NULL DEFAULT '',
  trim_path text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, side)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_sport_id ON products(sport_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_product_shapes_product_id ON product_shapes(product_id);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_shapes ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
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

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Product shapes policies
CREATE POLICY "Anyone can view product shapes"
  ON product_shapes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_shapes.product_id
      AND products.is_active = true
    )
  );

CREATE POLICY "Admins can view all product shapes"
  ON product_shapes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert product shapes"
  ON product_shapes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update product shapes"
  ON product_shapes FOR UPDATE
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

CREATE POLICY "Admins can delete product shapes"
  ON product_shapes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

DROP TRIGGER IF EXISTS product_shapes_updated_at ON product_shapes;
CREATE TRIGGER product_shapes_updated_at
  BEFORE UPDATE ON product_shapes
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();
