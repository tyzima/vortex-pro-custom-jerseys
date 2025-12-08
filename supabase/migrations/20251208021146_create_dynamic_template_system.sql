/*
  # Dynamic Template System Schema

  Creates a complete database-driven template system for custom jersey designs.

  ## New Tables

  ### 1. `sports`
  Stores top-level sport definitions (basketball, soccer, lacrosse, etc.)
  - `id` (uuid, primary key)
  - `slug` (text, unique) - URL-friendly identifier
  - `label` (text) - Display name
  - `display_order` (integer) - Sort order in UI
  - `is_active` (boolean) - Visibility toggle
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `product_cuts`
  Stores cut variations for each sport (mens, womens, unisex, youth)
  - `id` (uuid, primary key)
  - `sport_id` (uuid) - References sports(id)
  - `slug` (text) - Cut identifier
  - `label` (text) - Display name
  - `display_order` (integer)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `garment_paths`
  Stores base shape and trim SVG paths for jersey and shorts
  - `id` (uuid, primary key)
  - `cut_id` (uuid) - References product_cuts(id)
  - `garment_type` (text) - 'jersey' or 'shorts'
  - `path_type` (text) - 'shape' or 'trim'
  - `side` (text) - 'front' or 'back'
  - `svg_path` (text) - The actual SVG path data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `sport_templates`
  Stores design templates (previously design_templates, renamed for clarity)
  - `id` (uuid, primary key)
  - `sport_id` (uuid) - References sports(id)
  - `slug` (text) - Template identifier
  - `label` (text) - Display name
  - `display_order` (integer)
  - `is_published` (boolean)
  - `created_by` (uuid) - References profiles(id)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `template_layers`
  Stores individual layers within each template
  - `id` (uuid, primary key)
  - `template_id` (uuid) - References sport_templates(id)
  - `layer_slug` (text) - Layer identifier
  - `label` (text) - Display name
  - `display_order` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `layer_paths`
  Stores SVG paths for each layer
  - `id` (uuid, primary key)
  - `layer_id` (uuid) - References template_layers(id)
  - `garment_type` (text) - 'jersey' or 'shorts'
  - `side` (text) - 'front' or 'back'
  - `svg_path` (text) - The actual SVG path data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for authenticated users
  - Admin-only write access
*/

-- Create sports table
CREATE TABLE IF NOT EXISTS sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_cuts table
CREATE TABLE IF NOT EXISTS product_cuts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  slug text NOT NULL,
  label text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sport_id, slug)
);

-- Create garment_paths table
CREATE TABLE IF NOT EXISTS garment_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cut_id uuid NOT NULL REFERENCES product_cuts(id) ON DELETE CASCADE,
  garment_type text NOT NULL CHECK (garment_type IN ('jersey', 'shorts')),
  path_type text NOT NULL CHECK (path_type IN ('shape', 'trim')),
  side text NOT NULL CHECK (side IN ('front', 'back')),
  svg_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sport_templates table
CREATE TABLE IF NOT EXISTS sport_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  slug text NOT NULL,
  label text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sport_id, slug)
);

-- Create template_layers table
CREATE TABLE IF NOT EXISTS template_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES sport_templates(id) ON DELETE CASCADE,
  layer_slug text NOT NULL,
  label text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(template_id, layer_slug)
);

-- Create layer_paths table
CREATE TABLE IF NOT EXISTS layer_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id uuid NOT NULL REFERENCES template_layers(id) ON DELETE CASCADE,
  garment_type text NOT NULL CHECK (garment_type IN ('jersey', 'shorts')),
  side text NOT NULL CHECK (side IN ('front', 'back')),
  svg_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_cuts_sport_id ON product_cuts(sport_id);
CREATE INDEX IF NOT EXISTS idx_garment_paths_cut_id ON garment_paths(cut_id);
CREATE INDEX IF NOT EXISTS idx_garment_paths_lookup ON garment_paths(cut_id, garment_type, path_type, side);
CREATE INDEX IF NOT EXISTS idx_sport_templates_sport_id ON sport_templates(sport_id);
CREATE INDEX IF NOT EXISTS idx_template_layers_template_id ON template_layers(template_id);
CREATE INDEX IF NOT EXISTS idx_layer_paths_layer_id ON layer_paths(layer_id);
CREATE INDEX IF NOT EXISTS idx_layer_paths_lookup ON layer_paths(layer_id, garment_type, side);

-- Enable RLS on all tables
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE garment_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE sport_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE layer_paths ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sports
CREATE POLICY "Anyone can read sports"
  ON sports FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage sports"
  ON sports FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for product_cuts
CREATE POLICY "Anyone can read product cuts"
  ON product_cuts FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage product cuts"
  ON product_cuts FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for garment_paths
CREATE POLICY "Anyone can read garment paths"
  ON garment_paths FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage garment paths"
  ON garment_paths FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for sport_templates
CREATE POLICY "Anyone can read published templates"
  ON sport_templates FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage templates"
  ON sport_templates FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for template_layers
CREATE POLICY "Anyone can read template layers"
  ON template_layers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage template layers"
  ON template_layers FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for layer_paths
CREATE POLICY "Anyone can read layer paths"
  ON layer_paths FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage layer paths"
  ON layer_paths FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_sports_updated_at
  BEFORE UPDATE ON sports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_cuts_updated_at
  BEFORE UPDATE ON product_cuts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garment_paths_updated_at
  BEFORE UPDATE ON garment_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sport_templates_updated_at
  BEFORE UPDATE ON sport_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_layers_updated_at
  BEFORE UPDATE ON template_layers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_layer_paths_updated_at
  BEFORE UPDATE ON layer_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
