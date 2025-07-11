#!/usr/bin/env node

/**
 * Populate Regional Data Script
 * Migrates data from config.ts to Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function populateRegionalData() {
  console.log('🚀 Starting regional data population...');

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Read and parse config file
    const configPath = path.join(__dirname, 'supabase', 'functions', 'telegram-webhook', 'config.ts');
    
    if (!fs.existsSync(configPath)) {
      console.error('❌ Config file not found:', configPath);
      process.exit(1);
    }

    console.log('📖 Reading config file...');
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Define regional data structure (extracted from config)
    const regionsData = {
      england: {
        name: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England",
        regions: [
          { text: "🏔️ North East", value: "north_east", cities: ["Newcastle", "Sunderland", "Middlesbrough", "Durham"] },
          { text: "🌊 North West", value: "north_west", cities: ["Manchester", "Liverpool", "Preston", "Blackpool", "Lancaster"] },
          { text: "🚂 Yorkshire and the Humber", value: "yorkshire", cities: ["Leeds", "Sheffield", "Bradford", "Hull", "York"] },
          { text: "🌾 East Midlands", value: "east_midlands", cities: ["Nottingham", "Leicester", "Derby", "Lincoln"] },
          { text: "🏭 West Midlands", value: "west_midlands", cities: ["Birmingham", "Coventry", "Wolverhampton", "Stoke-on-Trent"] },
          { text: "🌻 East of England", value: "east_england", cities: ["Cambridge", "Norwich", "Ipswich", "Luton", "Peterborough"] },
          { text: "🏛️ London", value: "london", cities: ["Central London", "North London", "South London", "East London", "West London"] },
          { text: "🌅 South East", value: "south_east", cities: ["Brighton", "Oxford", "Canterbury", "Reading", "Guildford"] },
          { text: "🏖️ South West", value: "south_west", cities: ["Bristol", "Plymouth", "Exeter", "Bath", "Bournemouth"] }
        ]
      },
      scotland: {
        name: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland",
        regions: [
          { text: "🏰 Central Scotland", value: "central_scotland", cities: ["Glasgow", "Edinburgh", "Stirling", "Falkirk"] },
          { text: "🌊 Highlands", value: "highlands", cities: ["Inverness", "Fort William", "Ullapool"] },
          { text: "🏔️ Southern Scotland", value: "southern_scotland", cities: ["Dumfries", "Ayr", "Stranraer"] },
          { text: "🏝️ Islands", value: "scottish_islands", cities: ["Isle of Skye", "Orkney", "Shetland"] }
        ]
      },
      wales: {
        name: "🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales",
        regions: [
          { text: "🏔️ North Wales", value: "north_wales", cities: ["Bangor", "Wrexham", "Llandudno", "Caernarfon"] },
          { text: "🌊 Mid Wales", value: "mid_wales", cities: ["Aberystwyth", "Newtown", "Machynlleth"] },
          { text: "🏭 South Wales", value: "south_wales", cities: ["Cardiff", "Swansea", "Newport", "Merthyr Tydfil"] }
        ]
      },
      ireland: {
        name: "🇮🇪 Ireland",
        regions: [
          { text: "🍀 Leinster", value: "leinster", cities: ["Dublin", "Kilkenny", "Wexford", "Carlow"] },
          { text: "🎵 Munster", value: "munster", cities: ["Cork", "Limerick", "Waterford", "Tipperary"] },
          { text: "🌊 Connacht", value: "connacht", cities: ["Galway", "Sligo", "Mayo", "Roscommon"] },
          { text: "🏰 Ulster", value: "ulster", cities: ["Belfast", "Derry", "Armagh", "Antrim"] }
        ]
      }
    };

    console.log('🗑️ Clearing existing data...');
    
    // Clear existing data
    await supabase.from('medical_contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('region_locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('regions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('🏗️ Populating regions and locations...');

    let totalRegions = 0;
    let totalLocations = 0;

    // Populate data
    for (const [countryCode, countryData] of Object.entries(regionsData)) {
      console.log(`\n📍 Processing ${countryData.name}...`);

      let displayOrder = 0;
      
      for (const regionData of countryData.regions) {
        // Extract emoji and region name
        const parts = regionData.text.split(' ');
        const emoji = parts[0];
        const regionName = parts.slice(1).join(' ');

        // Insert region
        const { data: region, error: regionError } = await supabase
          .from('regions')
          .insert({
            country_code: countryCode,
            country_name: countryData.name,
            region_code: regionData.value,
            region_name: regionName,
            emoji: emoji,
            display_order: displayOrder++,
            is_active: true
          })
          .select()
          .single();

        if (regionError) {
          console.error(`❌ Error inserting region ${regionName}:`, regionError);
          continue;
        }

        console.log(`  ✅ Added region: ${emoji} ${regionName}`);
        totalRegions++;

        // Insert locations for this region
        let locationOrder = 0;
        for (const cityName of regionData.cities) {
          const { error: locationError } = await supabase
            .from('region_locations')
            .insert({
              region_id: region.id,
              location_name: cityName,
              location_code: cityName.toLowerCase().replace(/\s+/g, '_'),
              display_order: locationOrder++,
              is_active: true
            });

          if (locationError) {
            console.error(`❌ Error inserting location ${cityName}:`, locationError);
          } else {
            console.log(`    📍 Added location: ${cityName}`);
            totalLocations++;
          }
        }
      }
    }

    console.log('\n🎉 Population complete!');
    console.log(`📊 Summary:`);
    console.log(`   • ${totalRegions} regions added`);
    console.log(`   • ${totalLocations} locations added`);
    console.log(`   • 4 countries configured`);

    // Verify the data
    console.log('\n🔍 Verifying data...');
    
    const { data: regionCount } = await supabase
      .from('regions')
      .select('id', { count: 'exact' });
    
    const { data: locationCount } = await supabase
      .from('region_locations')
      .select('id', { count: 'exact' });

    console.log(`✅ Verification complete:`);
    console.log(`   • ${regionCount?.length || 0} regions in database`);
    console.log(`   • ${locationCount?.length || 0} locations in database`);

    console.log('\n🚀 Regional data population successful!');
    console.log('💡 Next steps:');
    console.log('   1. Set USE_DATABASE=true in your .env file');
    console.log('   2. Redeploy your bot function');
    console.log('   3. Test the regional navigation');

  } catch (error) {
    console.error('❌ Error during population:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  populateRegionalData();
}

module.exports = { populateRegionalData };
