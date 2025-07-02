-- Sample location data for testing the Telegram bot
-- This script adds some test locations to demonstrate bot functionality

INSERT INTO locations (name, address, type, latitude, longitude, rating, active, visits) VALUES
  ('London Eye', 'Westminster Bridge Rd, Bishop''s, London SE1 7PB, UK', 'city', '51.5033', '-0.1196', 4.8, true, 0),
  ('Tower Bridge', 'Tower Bridge Rd, London SE1 2UP, UK', 'city', '51.5055', '-0.0754', 4.7, true, 0),
  ('Big Ben', 'Westminster, London SW1A 0AA, UK', 'city', '51.4994', '-0.1245', 4.9, true, 0),
  ('Oxford Street', 'Oxford St, London, UK', 'city', '51.5154', '-0.1423', 4.5, true, 0),
  ('Camden Market', 'Buck St, London NW1 8AB, UK', 'city', '51.5414', '-0.1460', 4.6, true, 0),
  
  ('Oxford University', 'Wellington Square, Oxford OX1 2JD, UK', 'town', '51.7548', '-1.2544', 4.8, true, 0),
  ('Oxford Castle', 'New Rd, Oxford OX1 1AY, UK', 'town', '51.7520', '-1.2613', 4.3, true, 0),
  ('Carfax Tower', 'Carfax, Oxford OX1 3DT, UK', 'town', '51.7518', '-1.2579', 4.2, true, 0),
  
  ('Chipping Campden', 'High St, Chipping Campden GL55 6AT, UK', 'village', '52.0418', '-1.7814', 4.7, true, 0),
  ('Bourton-on-the-Water', 'Bourton-on-the-Water, Cheltenham GL54 2AN, UK', 'village', '51.8742', '-1.7598', 4.6, true, 0),
  ('Stow-on-the-Wold', 'Market Square, Stow-on-the-Wold, Cheltenham GL54 1AF, UK', 'village', '51.9308', '-1.6883', 4.5, true, 0),
  
  ('SW1A 1AA', 'Buckingham Palace, London SW1A 1AA, UK', 'postcode', '51.5014', '-0.1419', 4.8, true, 0),
  ('OX1 1DP', 'Christ Church, Oxford OX1 1DP, UK', 'postcode', '51.7505', '-1.2551', 4.7, true, 0),
  ('GL54 1AF', 'Market Square, Stow-on-the-Wold GL54 1AF, UK', 'postcode', '51.9308', '-1.6883', 4.5, true, 0);
