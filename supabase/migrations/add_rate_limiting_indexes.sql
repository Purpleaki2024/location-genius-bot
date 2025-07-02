-- Create table for rate limiting tracking
-- This table will help track user activities for rate limiting purposes

-- Add indexes to user_activities for efficient rate limiting queries
CREATE INDEX IF NOT EXISTS idx_user_activities_rate_limit 
ON user_activities(telegram_user_id, activity_type, created_at);

-- Add a partial index for recent activities (last hour) for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_recent 
ON user_activities(telegram_user_id, activity_type, created_at)
WHERE created_at >= (CURRENT_TIMESTAMP - INTERVAL '1 hour');

-- Create a function to clean up old activity records (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS void AS $$
BEGIN
  -- Delete activities older than 7 days
  DELETE FROM user_activities 
  WHERE created_at < (CURRENT_TIMESTAMP - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION cleanup_old_activities() IS 
'Removes user activities older than 7 days to keep the table size manageable';
