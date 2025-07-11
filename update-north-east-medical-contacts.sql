-- Update North East Medical Contacts with same contact info but different cities
-- All North East locations use the same contact details with "John Topper sent you" message

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
-- All use the same contact details but with different city names
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
  CASE 
    WHEN rd.location_name = 'Newcastle' THEN 'Top Shagger NE'
    WHEN rd.location_name = 'Durham' THEN 'Durham Medics'
    WHEN rd.location_name = 'Sunderland' THEN 'Sunderland Health'
    WHEN rd.location_name = 'Middlesbrough' THEN 'Middlesbrough Care'
  END as name,
  '+44 799 9877582' as phone, -- Same phone number for all
  'Medical Supplies 11am-12pm' as specialty, -- Same specialty for all
  CASE 
    WHEN rd.location_name = 'Newcastle' THEN 'Newcastle upon Tyne, Tyne and Wear, UK'
    WHEN rd.location_name = 'Durham' THEN 'Durham, County Durham, UK'
    WHEN rd.location_name = 'Sunderland' THEN 'Sunderland, Tyne and Wear, UK'
    WHEN rd.location_name = 'Middlesbrough' THEN 'Middlesbrough, North Yorkshire, UK'
  END as address,
  CASE 
    WHEN rd.location_name = 'Newcastle' THEN 54.9783
    WHEN rd.location_name = 'Durham' THEN 54.7761
    WHEN rd.location_name = 'Sunderland' THEN 54.9069
    WHEN rd.location_name = 'Middlesbrough' THEN 54.5742
  END as latitude,
  CASE 
    WHEN rd.location_name = 'Newcastle' THEN -1.6178
    WHEN rd.location_name = 'Durham' THEN -1.5733
    WHEN rd.location_name = 'Sunderland' THEN -1.3838
    WHEN rd.location_name = 'Middlesbrough' THEN -1.2351
  END as longitude,
  false as is_emergency,
  true as is_active
FROM region_data rd;

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
