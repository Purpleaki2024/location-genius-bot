-- Create bot_logs table for storing structured logs
CREATE TABLE IF NOT EXISTS bot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level VARCHAR(10) NOT NULL,
  message TEXT NOT NULL,
  user_id VARCHAR(50),
  chat_id VARCHAR(50),
  command VARCHAR(100),
  error_message TEXT,
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bot_logs_timestamp ON bot_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_bot_logs_level ON bot_logs(level);
CREATE INDEX IF NOT EXISTS idx_bot_logs_user_id ON bot_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_logs_command ON bot_logs(command);

-- Create stats functions for logs
CREATE OR REPLACE FUNCTION get_bot_log_stats(days_back INTEGER DEFAULT 1)
RETURNS TABLE (
  level TEXT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bl.level::TEXT,
    COUNT(*)::BIGINT
  FROM 
    bot_logs bl
  WHERE 
    bl.timestamp > (NOW() - (days_back || ' days')::INTERVAL)
  GROUP BY 
    bl.level
  ORDER BY 
    COUNT(*) DESC;
END;
$$;

-- Function to get summary of bot errors
CREATE OR REPLACE FUNCTION get_bot_error_summary(days_back INTEGER DEFAULT 1)
RETURNS TABLE (
  command TEXT,
  count BIGINT,
  last_occurrence TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(bl.command, 'unknown')::TEXT,
    COUNT(*)::BIGINT,
    MAX(bl.timestamp)::TIMESTAMPTZ
  FROM 
    bot_logs bl
  WHERE 
    bl.level = 'ERROR' AND
    bl.timestamp > (NOW() - (days_back || ' days')::INTERVAL)
  GROUP BY 
    COALESCE(bl.command, 'unknown')
  ORDER BY 
    COUNT(*) DESC;
END;
$$;

-- Function to get command usage statistics
CREATE OR REPLACE FUNCTION get_command_usage_stats(days_back INTEGER DEFAULT 1)
RETURNS TABLE (
  command TEXT,
  usage_count BIGINT,
  avg_duration_ms NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bl.command::TEXT,
    COUNT(*)::BIGINT AS usage_count,
    AVG(bl.duration_ms)::NUMERIC(10,2) AS avg_duration_ms
  FROM 
    bot_logs bl
  WHERE 
    bl.command IS NOT NULL AND
    bl.timestamp > (NOW() - (days_back || ' days')::INTERVAL)
  GROUP BY 
    bl.command
  ORDER BY 
    COUNT(*) DESC;
END;
$$;

-- Add RLS policies
ALTER TABLE bot_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy that only allows admins to view logs
CREATE POLICY bot_logs_admin_policy
  ON bot_logs
  FOR ALL
  USING (
    (SELECT is_admin FROM telegram_users WHERE telegram_id = auth.uid()::TEXT)
  );
