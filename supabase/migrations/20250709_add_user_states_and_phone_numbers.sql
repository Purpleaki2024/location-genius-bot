-- Migration to create user_states table for managing multi-step command flows
-- and phone_numbers table for storing contact information

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
CREATE INDEX IF NOT EXISTS idx_user_states_telegram_user_id ON public.user_states(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_user_states_state ON public.user_states(state);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_active ON public.phone_numbers(is_active);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_location ON public.phone_numbers(latitude, longitude);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_states_updated_at 
    BEFORE UPDATE ON public.user_states 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phone_numbers_updated_at 
    BEFORE UPDATE ON public.phone_numbers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample phone numbers for testing
INSERT INTO public.phone_numbers (phone_number, user_name, latitude, longitude) VALUES
    ('+44 7700 900123', 'John Smith', 51.5074, -0.1278),
    ('+44 7700 900456', 'Sarah Johnson', 51.5074, -0.1278),
    ('+44 7700 900789', 'Mike Davis', 51.5074, -0.1278),
    ('+1 555 123 4567', 'Alex Wilson', 40.7128, -74.0060),
    ('+1 555 987 6543', 'Emma Brown', 40.7128, -74.0060)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.user_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_states (allow all operations for now)
CREATE POLICY "Allow all operations on user_states" ON public.user_states
    FOR ALL USING (true);

-- Create RLS policies for phone_numbers (read-only for all, write for authenticated users)
CREATE POLICY "Allow read access to phone_numbers" ON public.phone_numbers
    FOR SELECT USING (true);

CREATE POLICY "Allow insert/update for authenticated users on phone_numbers" ON public.phone_numbers
    FOR ALL USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.user_states IS 'Stores user conversation states for multi-step bot commands';
COMMENT ON TABLE public.phone_numbers IS 'Stores phone numbers and their geographic locations for search functionality';
