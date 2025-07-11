-- Update North East Medical Contacts with unique details for each town
-- This script adds medical contacts for Newcastle, Sunderland, Middlesbrough, and Durham

-- First, get the region and location IDs we need
WITH region_data AS (
  SELECT 
    r.id as region_id,
    rl.id as location_id,
    rl.location_name
  FROM regions r
  JOIN region_locations rl ON r.id = rl.region_id
  WHERE r.region_code = 'north_east'
    AND rl.location_name IN ('Newcastle', 'Sunderland', 'Middlesbrough', 'Durham')
),
-- Clear any existing North East medical contacts to avoid duplicates
clear_existing AS (
  DELETE FROM medical_contacts 
  WHERE region_id IN (
    SELECT id FROM regions WHERE region_code = 'north_east'
  )
  RETURNING 1
)
-- Insert new medical contacts for each North East location
INSERT INTO medical_contacts (
  region_id, 
  location_id, 
  name, 
  phone, 
  specialty, 
  address, 
  latitude, 
  longitude, 
  is_emergency, 
  is_active
)
SELECT 
  rd.region_id,
  rd.location_id,
  contact_data.name,
  contact_data.phone,
  contact_data.specialty,
  contact_data.address,
  contact_data.latitude,
  contact_data.longitude,
  contact_data.is_emergency,
  true as is_active
FROM region_data rd
CROSS JOIN (
  -- Newcastle upon Tyne contacts
  SELECT 'Newcastle' as location_name, 'Top Shagger NE' as name, '+44 799 9877582' as phone, 'Medical Supplies' as specialty, 'Newcastle upon Tyne, Tyne and Wear, UK' as address, 54.9783 as latitude, -1.6178 as longitude, false as is_emergency
  UNION ALL
  SELECT 'Newcastle', 'Dr. James Newcastle', '+44 799 1111111', 'Emergency Medicine', 'Central Newcastle, Tyne and Wear, UK', 54.9783, -1.6178, true
  
  -- Sunderland contacts  
  UNION ALL
  SELECT 'Sunderland', 'Sunderland Health', '+44 799 7654321', 'Medical Supplies', 'Sunderland, Tyne and Wear, UK', 54.9069, -1.3838, false
  UNION ALL
  SELECT 'Sunderland', 'Dr. Sarah Sunderland', '+44 799 2222222', 'General Practice', 'City Centre, Sunderland, UK', 54.9069, -1.3838, false
  
  -- Middlesbrough contacts
  UNION ALL
  SELECT 'Middlesbrough', 'Middlesbrough Care', '+44 799 1122334', 'Medical Supplies', 'Middlesbrough, North Yorkshire, UK', 54.5742, -1.2351, false
  UNION ALL
  SELECT 'Middlesbrough', 'Dr. Michael Middlesbrough', '+44 799 3333333', 'Cardiology', 'Central Middlesbrough, UK', 54.5742, -1.2351, false
  
  -- Durham contacts
  UNION ALL
  SELECT 'Durham', 'Durham Medics', '+44 799 1234567', 'Medical Supplies', 'Durham, County Durham, UK', 54.7761, -1.5733, false
  UNION ALL
  SELECT 'Durham', 'Dr. Emily Durham', '+44 799 4444444', 'Pediatrics', 'Durham City Centre, UK', 54.7761, -1.5733, false
) contact_data
WHERE rd.location_name = contact_data.location_name;

-- Verify the insertions
SELECT 
  r.region_name,
  rl.location_name,
  mc.name,
  mc.phone,
  mc.specialty,
  mc.address
FROM regions r
JOIN region_locations rl ON r.id = rl.region_id
JOIN medical_contacts mc ON rl.id = mc.location_id
WHERE r.region_code = 'north_east'
ORDER BY rl.location_name, mc.name;
