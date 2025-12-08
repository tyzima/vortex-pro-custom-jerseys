/*
  # Add Product Details Columns

  1. Changes to product_cuts table
    - `base_price` (numeric) - Base price for this product cut
    - `description` (text) - Product description
    - `features` (jsonb) - Array of feature strings
    - `min_quantity` (integer) - Minimum order quantity
    - `production_time` (text) - Estimated production time

  2. Changes to design_templates table
    - `description` (text) - Template description
    - `preview_colors` (jsonb) - Default preview color scheme

  3. Notes
    - All new columns have sensible defaults
    - Existing data will remain intact
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_cuts' AND column_name = 'base_price'
  ) THEN
    ALTER TABLE product_cuts ADD COLUMN base_price numeric(10,2) DEFAULT 49.99;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_cuts' AND column_name = 'description'
  ) THEN
    ALTER TABLE product_cuts ADD COLUMN description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_cuts' AND column_name = 'features'
  ) THEN
    ALTER TABLE product_cuts ADD COLUMN features jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_cuts' AND column_name = 'min_quantity'
  ) THEN
    ALTER TABLE product_cuts ADD COLUMN min_quantity integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_cuts' AND column_name = 'production_time'
  ) THEN
    ALTER TABLE product_cuts ADD COLUMN production_time text DEFAULT '2-3 weeks';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'design_templates' AND column_name = 'description'
  ) THEN
    ALTER TABLE design_templates ADD COLUMN description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'design_templates' AND column_name = 'preview_colors'
  ) THEN
    ALTER TABLE design_templates ADD COLUMN preview_colors jsonb DEFAULT '{"primary": "#D2F802", "secondary": "#0a0a0a", "accent": "#ffffff"}'::jsonb;
  END IF;
END $$;