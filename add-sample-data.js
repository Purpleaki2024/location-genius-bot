import { createClient } from '@supabase/supabase-js'

// Load environment variables (use service role key for admin operations)
const supabaseUrl = 'https://clyhambeojuiuogdtyog.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseWhhbWJlb2Vvamdlb2p1aXVvZ2R0eW9nIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NDcyODEzMTUsImV4cCI6MjA2Mjg1NzMxNX0.G3UxW-iNstSoEaiwpOPqKzX03R0Jlf2IAaBShrNvyM0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    description: 'Iconic observation wheel on the South Bank'
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
    description: 'Historic bridge with glass floor walkways'
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
    description: 'Famous clock tower at Houses of Parliament'
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
    description: 'Major shopping street in Central London'
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
    description: 'Alternative market with unique shops and food'
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
    description: 'World-renowned university and historic buildings'
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
    description: 'Medieval castle with guided tours'
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
    description: 'Beautiful Cotswolds market town'
  }
]

async function addSampleData() {
  console.log('🚀 Adding sample location data...')
  
  try {
    // First, check if the locations table exists and what its structure is
    const { data: existingData, error: selectError } = await supabase
      .from('locations')
      .select('*')
      .limit(1)
    
    if (selectError) {
      console.error('❌ Error checking locations table:', selectError)
      console.log('📋 The locations table might not exist. Please create it first.')
      return
    }
    
    console.log('✅ Locations table exists')
    
    // Check if data already exists
    const { count } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true })
    
    if (count && count > 0) {
      console.log(`📊 Found ${count} existing locations in the database`)
      console.log('🔄 Clearing existing data and adding sample data...')
      
      // Clear existing data
      await supabase.from('locations').delete().neq('id', 0)
    }
    
    // Insert sample data
    const { data, error } = await supabase
      .from('locations')
      .insert(sampleLocations)
      .select()
    
    if (error) {
      console.error('❌ Error inserting sample data:', error)
      return
    }
    
    console.log(`✅ Successfully added ${sampleLocations.length} sample locations!`)
    console.log('🧪 Test your bot now with: /city London')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

addSampleData()
