#!/usr/bin/env node

// Script to add sample location data to Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clyhambeojuiuogdtyog.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseWhhbWJlb2p1aXVvZ2R0eW9nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI4MTMxNSwiZXhwIjoyMDYyODU3MzE1fQ.pTCBDZsgzsTHb17-hwm8aECyGFPT1Dx_hkbgffUYjCo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleLocations = [
  {
    name: 'London Eye',
    address: 'Westminster Bridge Rd, Bishop\'s, London SE1 7PB, UK',
    type: 'city',
    lat: 51.5033,
    lng: -0.1196,
    rating: 4.8,
    active: true,
    visits: 0,
    created_by: 'system'
  },
  {
    name: 'Tower Bridge',
    address: 'Tower Bridge Rd, London SE1 2UP, UK',
    type: 'city',
    lat: 51.5055,
    lng: -0.0754,
    rating: 4.7,
    active: true,
    visits: 0,
    created_by: 'system'
  },
  {
    name: 'Big Ben',
    address: 'Westminster, London SW1A 0AA, UK',
    type: 'city',
    lat: 51.4994,
    lng: -0.1245,
    rating: 4.9,
    active: true,
    visits: 0,
    created_by: 'system'
  },
  {
    name: 'Oxford Street',
    address: 'Oxford St, London, UK',
    type: 'city',
    lat: 51.5154,
    lng: -0.1423,
    rating: 4.5,
    active: true,
    visits: 0,
    created_by: 'system'
  },
  {
    name: 'Camden Market',
    address: 'Buck St, London NW1 8AB, UK',
    type: 'city',
    lat: 51.5414,
    lng: -0.1460,
    rating: 4.6,
    active: true,
    visits: 0,
    created_by: 'system'
  },
  {
    name: 'Oxford University',
    address: 'Wellington Square, Oxford OX1 2JD, UK',
    type: 'town',
    lat: 51.7548,
    lng: -1.2544,
    rating: 4.8,
    active: true,
    visits: 0,
    created_by: 'system'
  },
  {
    name: 'Oxford Castle',
    address: 'New Rd, Oxford OX1 1AY, UK',
    type: 'town',
    lat: 51.7520,
    lng: -1.2613,
    rating: 4.3,
    active: true,
    visits: 0,
    created_by: 'system'
  },
  {
    name: 'Chipping Campden',
    address: 'High St, Chipping Campden GL55 6AT, UK',
    type: 'village',
    lat: 52.0418,
    lng: -1.7814,
    rating: 4.7,
    active: true,
    visits: 0,
    created_by: 'system'
  },
  {
    name: 'Bourton-on-the-Water',
    address: 'Bourton-on-the-Water, Cheltenham GL54 2AN, UK',
    type: 'village',
    lat: 51.8742,
    lng: -1.7598,
    rating: 4.6,
    active: true,
    visits: 0,
    created_by: 'system'
  }
];

async function addSampleData() {
  console.log('🚀 Adding sample location data...');
  
  try {
    // First, clear any existing test data
    await supabase
      .from('locations')
      .delete()
      .eq('created_by', 'system');
    
    // Insert sample data
    const { data, error } = await supabase
      .from('locations')
      .insert(sampleLocations);
    
    if (error) {
      console.error('❌ Error adding sample data:', error);
      process.exit(1);
    }
    
    console.log('✅ Sample data added successfully!');
    console.log(`📊 Added ${sampleLocations.length} locations`);
    
    // Verify the data was added
    const { data: locations, error: fetchError } = await supabase
      .from('locations')
      .select('*')
      .eq('created_by', 'system');
    
    if (fetchError) {
      console.error('❌ Error verifying data:', fetchError);
    } else {
      console.log(`✅ Verified: ${locations.length} locations in database`);
    }
    
    console.log('\n🧪 Now test your bot with:');
    console.log('   /city London - Should find 5 London locations');
    console.log('   /town Oxford - Should find 2 Oxford locations');
    console.log('   /village Campden - Should find Cotswold villages');
    console.log('   London Eye - Direct search');
    
  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
}

addSampleData();
