
-- Create user sessions tracking table
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.telegram_users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  command_count INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bot health monitoring table
CREATE TABLE public.bot_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL,
  response_time_ms INTEGER,
  memory_usage_mb FLOAT,
  active_connections INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance location_searches table with additional analytics columns
ALTER TABLE public.location_searches ADD COLUMN IF NOT EXISTS search_result_count INTEGER DEFAULT 0;
ALTER TABLE public.location_searches ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true;
ALTER TABLE public.location_searches ADD COLUMN IF NOT EXISTS response_time_ms INTEGER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_start_time ON public.user_sessions(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bot_logs_timestamp ON public.bot_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_bot_logs_level_timestamp ON public.bot_logs(level, timestamp);
CREATE INDEX IF NOT EXISTS idx_location_searches_created_at ON public.location_searches(created_at);
CREATE INDEX IF NOT EXISTS idx_telegram_users_last_seen ON public.telegram_users(last_seen);

-- Create database functions for analytics aggregation
CREATE OR REPLACE FUNCTION public.get_user_activity_stats(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  date DATE,
  active_users BIGINT,
  total_commands BIGINT,
  avg_session_duration NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(bl.timestamp) as date,
    COUNT(DISTINCT bl.user_id) as active_users,
    COUNT(*) as total_commands,
    COALESCE(AVG(us.duration_seconds), 0) as avg_session_duration
  FROM bot_logs bl
  LEFT JOIN user_sessions us ON us.user_id = bl.user_id::uuid 
    AND DATE(us.start_time) = DATE(bl.timestamp)
  WHERE bl.timestamp >= NOW() - (days_back || ' days')::INTERVAL
    AND bl.user_id IS NOT NULL
  GROUP BY DATE(bl.timestamp)
  ORDER BY date DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_location_search_stats(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  date DATE,
  total_searches BIGINT,
  successful_searches BIGINT,
  avg_response_time NUMERIC,
  unique_users BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(ls.created_at) as date,
    COUNT(*) as total_searches,
    COUNT(*) FILTER (WHERE ls.success = true) as successful_searches,
    COALESCE(AVG(ls.response_time_ms), 0) as avg_response_time,
    COUNT(DISTINCT ls.telegram_user_id) as unique_users
  FROM location_searches ls
  WHERE ls.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(ls.created_at)
  ORDER BY date DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_bot_performance_stats(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  date DATE,
  total_requests BIGINT,
  error_count BIGINT,
  avg_duration_ms NUMERIC,
  success_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(bl.timestamp) as date,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE bl.level = 'ERROR') as error_count,
    COALESCE(AVG(bl.duration_ms), 0) as avg_duration_ms,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) - COUNT(*) FILTER (WHERE bl.level = 'ERROR'))::NUMERIC / COUNT(*)::NUMERIC * 100, 2)
      ELSE 0 
    END as success_rate
  FROM bot_logs bl
  WHERE bl.timestamp >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(bl.timestamp)
  ORDER BY date DESC;
END;
$$;

-- Enable RLS on new tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_health_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view user sessions" 
  ON public.user_sessions FOR SELECT 
  USING (true);

CREATE POLICY "Allow service role to manage user sessions" 
  ON public.user_sessions FOR ALL 
  USING (true);

CREATE POLICY "Allow authenticated users to view bot health checks" 
  ON public.bot_health_checks FOR SELECT 
  USING (true);

CREATE POLICY "Allow service role to manage bot health checks" 
  ON public.bot_health_checks FOR ALL 
  USING (true);
