-- Create user_states table for managing conversation flow
CREATE TABLE IF NOT EXISTS user_states (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  state VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_states_user_id ON user_states(user_id);

-- Insert the table creation into the database
-- You can run this via the Supabase dashboard SQL editor
