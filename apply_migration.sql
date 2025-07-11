-- Apply the regional location management migration
-- Execute this in your Supabase SQL Editor

-- Regional Location Management System
-- Creates tables for managing regions and their associated locations

-- Regions table (UK, Scotland, Wales, Ireland)
CREATE TABLE IF NOT EXISTS regions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code VARCHAR(10) NOT NULL, -- 'england', 'scotland', 'wales', 'ireland'
  country_name VARCHAR(50) NOT NULL,
  region_code VARCHAR(50) NOT NULL,
  region_name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table (cities/towns within regions)
CREATE TABLE IF NOT EXISTS region_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  location_name VARCHAR(100) NOT NULL,
  location_code VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical contacts table (enhanced to link with regions)
CREATE TABLE IF NOT EXISTS medical_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID REFERENCES regions(id),
  location_id UUID REFERENCES region_locations(id),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  specialty VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_emergency BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_regions_country ON regions(country_code);
CREATE INDEX IF NOT EXISTS idx_regions_active ON regions(is_active);
CREATE INDEX IF NOT EXISTS idx_region_locations_region ON region_locations(region_id);
CREATE INDEX IF NOT EXISTS idx_region_locations_active ON region_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_medical_contacts_region ON medical_contacts(region_id);
CREATE INDEX IF NOT EXISTS idx_medical_contacts_location ON medical_contacts(location_id);
CREATE INDEX IF NOT EXISTS idx_medical_contacts_active ON medical_contacts(is_active);

-- RLS (Row Level Security) policies
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for regions" ON regions;
DROP POLICY IF EXISTS "Public read access for region_locations" ON region_locations;
DROP POLICY IF EXISTS "Public read access for medical_contacts" ON medical_contacts;
DROP POLICY IF EXISTS "Admin write access for regions" ON regions;
DROP POLICY IF EXISTS "Admin write access for region_locations" ON region_locations;
DROP POLICY IF EXISTS "Admin write access for medical_contacts" ON medical_contacts;

-- Allow public read access for bot functionality
CREATE POLICY "Public read access for regions" ON regions FOR SELECT USING (true);
CREATE POLICY "Public read access for region_locations" ON region_locations FOR SELECT USING (true);
CREATE POLICY "Public read access for medical_contacts" ON medical_contacts FOR SELECT USING (true);

-- Admin-only write access (requires authentication)
CREATE POLICY "Admin write access for regions" ON regions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for region_locations" ON region_locations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for medical_contacts" ON medical_contacts FOR ALL USING (auth.role() = 'authenticated');

-- Clear existing data to avoid duplicates
DELETE FROM region_locations;
DELETE FROM regions;

-- Insert initial region data
INSERT INTO regions (country_code, country_name, region_code, region_name, emoji, display_order) VALUES
-- England
('england', 'England', 'north_east', 'North East', '🏔️', 1),
('england', 'England', 'north_west', 'North West', '🌊', 2),
('england', 'England', 'yorkshire', 'Yorkshire and the Humber', '🚂', 3),
('england', 'England', 'east_midlands', 'East Midlands', '🌾', 4),
('england', 'England', 'west_midlands', 'West Midlands', '🏭', 5),
('england', 'England', 'east_england', 'East of England', '🌻', 6),
('england', 'England', 'london', 'London', '🏛️', 7),
('england', 'England', 'south_east', 'South East', '🌅', 8),
('england', 'England', 'south_west', 'South West', '🏖️', 9),

-- Scotland
('scotland', 'Scotland', 'central_scotland', 'Central Scotland', '🏰', 10),
('scotland', 'Scotland', 'highlands', 'Highlands', '🌊', 11),
('scotland', 'Scotland', 'southern_scotland', 'Southern Scotland', '🏔️', 12),
('scotland', 'Scotland', 'scottish_islands', 'Islands', '🏝️', 13),

-- Wales
('wales', 'Wales', 'north_wales', 'North Wales', '🏔️', 14),
('wales', 'Wales', 'mid_wales', 'Mid Wales', '🌊', 15),
('wales', 'Wales', 'south_wales', 'South Wales', '🏭', 16),

-- Ireland
('ireland', 'Ireland', 'leinster', 'Leinster', '🍀', 17),
('ireland', 'Ireland', 'munster', 'Munster', '🎵', 18),
('ireland', 'Ireland', 'connacht', 'Connacht', '🌊', 19),
('ireland', 'Ireland', 'ulster', 'Ulster', '🏰', 20);

-- Insert sample locations for each region
WITH region_data AS (
  SELECT id, region_code FROM regions
)
INSERT INTO region_locations (region_id, location_name, location_code, display_order) 
SELECT 
  r.id,
  loc.location_name,
  LOWER(REPLACE(loc.location_name, ' ', '_')),
  loc.display_order
FROM region_data r
CROSS JOIN (
  -- North East
  SELECT 'Newcastle' as location_name, 1 as display_order, 'north_east' as region_code
  UNION ALL SELECT 'Sunderland', 2, 'north_east'
  UNION ALL SELECT 'Middlesbrough', 3, 'north_east'
  UNION ALL SELECT 'Durham', 4, 'north_east'
  
  -- North West
  UNION ALL SELECT 'Manchester', 1, 'north_west'
  UNION ALL SELECT 'Liverpool', 2, 'north_west'
  UNION ALL SELECT 'Preston', 3, 'north_west'
  UNION ALL SELECT 'Blackpool', 4, 'north_west'
  UNION ALL SELECT 'Lancaster', 5, 'north_west'
  
  -- Yorkshire and the Humber
  UNION ALL SELECT 'Leeds', 1, 'yorkshire'
  UNION ALL SELECT 'Sheffield', 2, 'yorkshire'
  UNION ALL SELECT 'Bradford', 3, 'yorkshire'
  UNION ALL SELECT 'Hull', 4, 'yorkshire'
  UNION ALL SELECT 'York', 5, 'yorkshire'
  
  -- East Midlands
  UNION ALL SELECT 'Nottingham', 1, 'east_midlands'
  UNION ALL SELECT 'Leicester', 2, 'east_midlands'
  UNION ALL SELECT 'Derby', 3, 'east_midlands'
  UNION ALL SELECT 'Lincoln', 4, 'east_midlands'
  
  -- West Midlands
  UNION ALL SELECT 'Birmingham', 1, 'west_midlands'
  UNION ALL SELECT 'Coventry', 2, 'west_midlands'
  UNION ALL SELECT 'Wolverhampton', 3, 'west_midlands'
  UNION ALL SELECT 'Stoke-on-Trent', 4, 'west_midlands'
  
  -- East of England
  UNION ALL SELECT 'Cambridge', 1, 'east_england'
  UNION ALL SELECT 'Norwich', 2, 'east_england'
  UNION ALL SELECT 'Ipswich', 3, 'east_england'
  UNION ALL SELECT 'Luton', 4, 'east_england'
  UNION ALL SELECT 'Peterborough', 5, 'east_england'
  
  -- London
  UNION ALL SELECT 'Central London', 1, 'london'
  UNION ALL SELECT 'North London', 2, 'london'
  UNION ALL SELECT 'South London', 3, 'london'
  UNION ALL SELECT 'East London', 4, 'london'
  UNION ALL SELECT 'West London', 5, 'london'
  
  -- South East
  UNION ALL SELECT 'Brighton', 1, 'south_east'
  UNION ALL SELECT 'Oxford', 2, 'south_east'
  UNION ALL SELECT 'Canterbury', 3, 'south_east'
  UNION ALL SELECT 'Reading', 4, 'south_east'
  UNION ALL SELECT 'Guildford', 5, 'south_east'
  
  -- South West
  UNION ALL SELECT 'Bristol', 1, 'south_west'
  UNION ALL SELECT 'Plymouth', 2, 'south_west'
  UNION ALL SELECT 'Exeter', 3, 'south_west'
  UNION ALL SELECT 'Bath', 4, 'south_west'
  UNION ALL SELECT 'Bournemouth', 5, 'south_west'
  
  -- Scotland
  UNION ALL SELECT 'Glasgow', 1, 'central_scotland'
  UNION ALL SELECT 'Edinburgh', 2, 'central_scotland'
  UNION ALL SELECT 'Stirling', 3, 'central_scotland'
  UNION ALL SELECT 'Falkirk', 4, 'central_scotland'
  
  UNION ALL SELECT 'Inverness', 1, 'highlands'
  UNION ALL SELECT 'Fort William', 2, 'highlands'
  UNION ALL SELECT 'Ullapool', 3, 'highlands'
  
  UNION ALL SELECT 'Dumfries', 1, 'southern_scotland'
  UNION ALL SELECT 'Ayr', 2, 'southern_scotland'
  UNION ALL SELECT 'Stranraer', 3, 'southern_scotland'
  
  UNION ALL SELECT 'Isle of Skye', 1, 'scottish_islands'
  UNION ALL SELECT 'Orkney', 2, 'scottish_islands'
  UNION ALL SELECT 'Shetland', 3, 'scottish_islands'
  
  -- Wales
  UNION ALL SELECT 'Bangor', 1, 'north_wales'
  UNION ALL SELECT 'Wrexham', 2, 'north_wales'
  UNION ALL SELECT 'Llandudno', 3, 'north_wales'
  UNION ALL SELECT 'Caernarfon', 4, 'north_wales'
  
  UNION ALL SELECT 'Aberystwyth', 1, 'mid_wales'
  UNION ALL SELECT 'Newtown', 2, 'mid_wales'
  UNION ALL SELECT 'Machynlleth', 3, 'mid_wales'
  
  UNION ALL SELECT 'Cardiff', 1, 'south_wales'
  UNION ALL SELECT 'Swansea', 2, 'south_wales'
  UNION ALL SELECT 'Newport', 3, 'south_wales'
  UNION ALL SELECT 'Merthyr Tydfil', 4, 'south_wales'
  
  -- Ireland
  UNION ALL SELECT 'Dublin', 1, 'leinster'
  UNION ALL SELECT 'Kilkenny', 2, 'leinster'
  UNION ALL SELECT 'Wexford', 3, 'leinster'
  UNION ALL SELECT 'Carlow', 4, 'leinster'
  
  UNION ALL SELECT 'Cork', 1, 'munster'
  UNION ALL SELECT 'Limerick', 2, 'munster'
  UNION ALL SELECT 'Waterford', 3, 'munster'
  UNION ALL SELECT 'Tipperary', 4, 'munster'
  
  UNION ALL SELECT 'Galway', 1, 'connacht'
  UNION ALL SELECT 'Sligo', 2, 'connacht'
  UNION ALL SELECT 'Mayo', 3, 'connacht'
  UNION ALL SELECT 'Roscommon', 4, 'connacht'
  
  UNION ALL SELECT 'Belfast', 1, 'ulster'
  UNION ALL SELECT 'Derry', 2, 'ulster'
  UNION ALL SELECT 'Armagh', 3, 'ulster'
  UNION ALL SELECT 'Antrim', 4, 'ulster'
) loc 
WHERE r.region_code = loc.region_code;

-- Verify the data
SELECT 'Regions created:' as status, COUNT(*) as count FROM regions;
SELECT 'Locations created:' as status, COUNT(*) as count FROM region_locations;

-- Show sample data
SELECT r.country_name, r.region_name, COUNT(rl.id) as location_count
FROM regions r
LEFT JOIN region_locations rl ON r.id = rl.region_id
WHERE r.is_active = true
GROUP BY r.id, r.country_name, r.region_name, r.display_order
ORDER BY r.display_order;
