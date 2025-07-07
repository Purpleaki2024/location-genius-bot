
-- Drop unnecessary tables that aren't shown in your form
DROP TABLE IF EXISTS business_locations CASCADE;
DROP TABLE IF EXISTS message_templates CASCADE;

-- Ensure the locations table has all the fields from your form
-- First, let's check if we need to add any missing columns to the existing locations table
ALTER TABLE locations 
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS postcode TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS password TEXT,
  ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_code ON locations(code);
CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country);
CREATE INDEX IF NOT EXISTS idx_locations_postcode ON locations(postcode);

-- Update the locations table to match your form requirements exactly
-- Make sure required fields are properly set up
ALTER TABLE locations 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN lat SET NOT NULL,
  ALTER COLUMN lng SET NOT NULL;

-- Add a comment to document the table structure
COMMENT ON TABLE locations IS 'Main locations table matching the Add New Location form requirements';
COMMENT ON COLUMN locations.code IS 'Location code (required)';
COMMENT ON COLUMN locations.name IS 'Location name (required)';
COMMENT ON COLUMN locations.lat IS 'Latitude (required)';
COMMENT ON COLUMN locations.lng IS 'Longitude (required)';
COMMENT ON COLUMN locations.country IS 'Country (required)';
COMMENT ON COLUMN locations.region IS 'Region (optional)';
COMMENT ON COLUMN locations.postcode IS 'Postcode (optional)';
COMMENT ON COLUMN locations.phone_number IS 'Phone number (optional)';
COMMENT ON COLUMN locations.password IS 'Password for users to contact (defaults to location name)';
COMMENT ON COLUMN locations.additional_info IS 'Additional information (optional)';
