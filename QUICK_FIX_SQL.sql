-- 🎯 Quick Fix for Telegram Bot Database
-- Copy and paste this ENTIRE script into your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/clyhambeojuiuogdtyog/sql

-- Step 1: Clear any existing test data
DELETE FROM locations WHERE name IN ('London Eye', 'Tower Bridge', 'Big Ben', 'Oxford Street', 'Camden Market', 'Oxford University', 'Oxford Castle', 'Chipping Campden');

-- Step 2: Insert sample data that matches your bot's search logic
INSERT INTO locations (name, address, type, lat, lng, rating, active, visits, description) VALUES
  ('London Eye', 'Westminster Bridge Rd, Bishop''s, London SE1 7PB, UK', 'city', 51.5033, -0.1196, 4.8, true, 0, 'Iconic observation wheel on the South Bank'),
  ('Tower Bridge', 'Tower Bridge Rd, London SE1 2UP, UK', 'city', 51.5055, -0.0754, 4.7, true, 0, 'Historic bridge with glass floor walkways'),
  ('Big Ben', 'Westminster, London SW1A 0AA, UK', 'city', 51.4994, -0.1245, 4.9, true, 0, 'Famous clock tower at Houses of Parliament'),
  ('Oxford Street', 'Oxford St, London, UK', 'city', 51.5154, -0.1423, 4.5, true, 0, 'Major shopping street in Central London'),
  ('Camden Market', 'Buck St, London NW1 8AB, UK', 'city', 51.5414, -0.1460, 4.6, true, 0, 'Alternative market with unique shops and food'),
  
  ('Oxford University', 'Wellington Square, Oxford OX1 2JD, UK', 'town', 51.7548, -1.2544, 4.8, true, 0, 'World-renowned university and historic buildings'),
  ('Oxford Castle', 'New Rd, Oxford OX1 1AY, UK', 'town', 51.7520, -1.2613, 4.3, true, 0, 'Medieval castle with guided tours'),
  ('Carfax Tower', 'Carfax, Oxford OX1 3DT, UK', 'town', 51.7518, -1.2579, 4.2, true, 0, 'Historic tower in the city center'),
  
  ('Chipping Campden', 'High St, Chipping Campden GL55 6AT, UK', 'village', 52.0418, -1.7814, 4.7, true, 0, 'Beautiful Cotswolds market town'),
  ('Bourton-on-the-Water', 'Bourton-on-the-Water, Cheltenham GL54 2AN, UK', 'village', 51.8742, -1.7598, 4.6, true, 0, 'Venice of the Cotswolds with lovely bridges'),
  ('Stow-on-the-Wold', 'Market Square, Stow-on-the-Wold, Cheltenham GL54 1AF, UK', 'village', 51.9308, -1.6883, 4.5, true, 0, 'Historic market town with antique shops'),
  
  ('SW1A 1AA Area', 'Buckingham Palace, London SW1A 1AA, UK', 'postcode', 51.5014, -0.1419, 4.8, true, 0, 'Royal residence and working palace'),
  ('OX1 1DP Area', 'Christ Church, Oxford OX1 1DP, UK', 'postcode', 51.7505, -1.2551, 4.7, true, 0, 'Famous college and filming location'),
  ('GL54 1AF Area', 'Market Square, Stow-on-the-Wold GL54 1AF, UK', 'postcode', 51.9308, -1.6883, 4.5, true, 0, 'Central market square location');

-- Step 3: Verify the data was inserted
SELECT 
  name, 
  type, 
  address,
  rating,
  active
FROM locations 
WHERE active = true 
ORDER BY type, name;

-- ✅ After running this, test your bot with:
-- /city London (should find 5 locations)
-- /town Oxford (should find 3 locations)  
-- /village Campden (should find 3 locations)
-- London Eye (direct search should work)
