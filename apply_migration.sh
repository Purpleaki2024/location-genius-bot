#!/bin/bash

# Apply Regional Database Migration
# This script applies the database migration using Supabase API

echo "🚀 Applying Regional Location Database Migration..."

# Read the SQL file
SQL_CONTENT=$(cat apply_migration.sql)

# Apply via curl to Supabase Rest API
curl -X POST \
  "https://clyhambeojuiuogdtyog.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$SQL_CONTENT\"}"

echo ""
echo "✅ Migration application complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/clyhambeojuiuogdtyog"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of apply_migration.sql"
echo "4. Execute the script to create tables and populate data"
echo ""
echo "🔍 You can then verify the data by running:"
echo "SELECT * FROM regions ORDER BY display_order;"
echo "SELECT * FROM region_locations LIMIT 10;"
