-- Create bot_logs table for comprehensive logging
CREATE TABLE IF NOT EXISTS bot_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    level TEXT NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR')),
    message TEXT NOT NULL,
    user_id TEXT,
    chat_id TEXT,
    command TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bot_logs_timestamp ON bot_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bot_logs_level ON bot_logs(level);
CREATE INDEX IF NOT EXISTS idx_bot_logs_user_id ON bot_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_logs_command ON bot_logs(command);
CREATE INDEX IF NOT EXISTS idx_bot_logs_created_at ON bot_logs(created_at DESC);

-- Create a function to clean up old logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_bot_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM bot_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get bot log statistics
CREATE OR REPLACE FUNCTION get_bot_log_stats(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    level TEXT,
    count BIGINT,
    avg_duration_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bl.level,
        COUNT(*) as count,
        ROUND(AVG(bl.duration_ms), 2) as avg_duration_ms
    FROM bot_logs bl
    WHERE bl.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY bl.level
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get error summary
CREATE OR REPLACE FUNCTION get_bot_error_summary(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    error_message TEXT,
    command TEXT,
    count BIGINT,
    last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bl.error_message,
        bl.command,
        COUNT(*) as count,
        MAX(bl.timestamp) as last_occurrence
    FROM bot_logs bl
    WHERE bl.level = 'ERROR' 
    AND bl.created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND bl.error_message IS NOT NULL
    GROUP BY bl.error_message, bl.command
    ORDER BY count DESC, last_occurrence DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get command usage statistics
CREATE OR REPLACE FUNCTION get_command_usage_stats(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    command TEXT,
    usage_count BIGINT,
    avg_duration_ms NUMERIC,
    error_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bl.command,
        COUNT(*) as usage_count,
        ROUND(AVG(bl.duration_ms), 2) as avg_duration_ms,
        COUNT(CASE WHEN bl.level = 'ERROR' THEN 1 END) as error_count
    FROM bot_logs bl
    WHERE bl.command IS NOT NULL
    AND bl.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY bl.command
    ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT ON bot_logs TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_bot_logs() TO authenticated;
GRANT EXECUTE ON FUNCTION get_bot_log_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_bot_error_summary(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_command_usage_stats(INTEGER) TO authenticated;

-- Add a comment to the table
COMMENT ON TABLE bot_logs IS 'Comprehensive logging table for Telegram bot activities, errors, and performance metrics';
