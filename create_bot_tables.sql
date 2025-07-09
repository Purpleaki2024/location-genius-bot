-- Complete Telegram Bot Database Setup
-- Run this script in your Supabase SQL Editor to create all required tables

-- Create telegram_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.telegram_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Create bot_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bot_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    level TEXT NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    user_id TEXT,
    chat_id TEXT,
    command TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create location_searches table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.location_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.telegram_users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    query_type TEXT DEFAULT 'text',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    search_result_count INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT true,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_states table for managing conversation state
CREATE TABLE IF NOT EXISTS public.user_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL DEFAULT 'start',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create phone_numbers table for storing contact information
CREATE TABLE IF NOT EXISTS public.phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    user_name TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_id ON public.telegram_users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_last_seen ON public.telegram_users(last_seen);
CREATE INDEX IF NOT EXISTS idx_user_states_telegram_user_id ON public.user_states(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_user_states_state ON public.user_states(state);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_active ON public.phone_numbers(is_active);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_location ON public.phone_numbers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_bot_logs_timestamp ON public.bot_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_bot_logs_level_timestamp ON public.bot_logs(level, timestamp);
CREATE INDEX IF NOT EXISTS idx_location_searches_created_at ON public.location_searches(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_telegram_users_updated_at ON public.telegram_users;
CREATE TRIGGER update_telegram_users_updated_at 
    BEFORE UPDATE ON public.telegram_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_states_updated_at ON public.user_states;
CREATE TRIGGER update_user_states_updated_at 
    BEFORE UPDATE ON public.user_states 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_phone_numbers_updated_at ON public.phone_numbers;
CREATE TRIGGER update_phone_numbers_updated_at 
    BEFORE UPDATE ON public.phone_numbers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample phone numbers for testing
INSERT INTO public.phone_numbers (phone_number, user_name, latitude, longitude) VALUES
    ('+44 7700 900123', 'John Smith', 51.5074, -0.1278),
    ('+44 7700 900456', 'Sarah Johnson', 51.5074, -0.1278),
    ('+44 7700 900789', 'Mike Davis', 51.5074, -0.1278),
    ('+1 555 123 4567', 'Alex Wilson', 40.7128, -74.0060),
    ('+1 555 987 6543', 'Emma Brown', 40.7128, -74.0060),
    ('+44 7700 900001', 'London Contact 1', 51.5074, -0.1278),
    ('+44 7700 900002', 'London Contact 2', 51.5074, -0.1278)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_searches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for service role)
DROP POLICY IF EXISTS "Allow all operations on telegram_users" ON public.telegram_users;
CREATE POLICY "Allow all operations on telegram_users" ON public.telegram_users
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on user_states" ON public.user_states;
CREATE POLICY "Allow all operations on user_states" ON public.user_states
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow read access to phone_numbers" ON public.phone_numbers;
CREATE POLICY "Allow read access to phone_numbers" ON public.phone_numbers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert/update for authenticated users on phone_numbers" ON public.phone_numbers;
CREATE POLICY "Allow insert/update for authenticated users on phone_numbers" ON public.phone_numbers
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on bot_logs" ON public.bot_logs;
CREATE POLICY "Allow all operations on bot_logs" ON public.bot_logs
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on location_searches" ON public.location_searches;
CREATE POLICY "Allow all operations on location_searches" ON public.location_searches
    FOR ALL USING (true);

-- Add comments
COMMENT ON TABLE public.telegram_users IS 'Stores Telegram user information and preferences';
COMMENT ON TABLE public.user_states IS 'Stores user conversation states for multi-step bot commands';
COMMENT ON TABLE public.phone_numbers IS 'Stores phone numbers and their geographic locations for search functionality';
COMMENT ON TABLE public.bot_logs IS 'Comprehensive logging for bot operations and debugging';
COMMENT ON TABLE public.location_searches IS 'Tracks location search history and analytics';

-- Select sample data to verify
SELECT 'Phone Numbers Created:' as status, count(*) as count FROM public.phone_numbers;
SELECT 'Tables Created Successfully' as status;
