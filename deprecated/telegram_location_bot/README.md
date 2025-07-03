# Deprecated Python Bot and Flask Admin

This folder contains the legacy Python bot and Flask admin files that have been deprecated in favor of the Supabase/React stack.

## Migration Details
- All bot actions and analytics are now handled by Supabase Edge Functions.
- The React admin dashboard fetches live stats from Supabase.

## Files Moved
- `telegram_location_bot/` has been moved here for archival purposes.

## Next Steps
- Ensure all integrations are functional.
- Remove this folder after confirming no dependencies remain.
