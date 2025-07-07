-- Create message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'welcome', 'location_result', 'help', etc.
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names used in template
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(type) -- Only one template per type can be active
);

-- Create index for faster lookups
CREATE INDEX idx_message_templates_type ON message_templates(type);
CREATE INDEX idx_message_templates_active ON message_templates(is_active);

-- Insert default templates
INSERT INTO message_templates (name, type, content, variables) VALUES 
(
  'Welcome Message',
  'welcome',
  'Hello Gorgeous,

As an esteemed member of The Location Finder Chat 💎, you are bestowed with the following limits:

🎯 {daily_limit} requests per 24hrs
⚡ {remaining_requests} requests left for today

For immediate results, simply send a location code.

Click /help for an array of other, tempting commands.',
  '["daily_limit", "remaining_requests"]'::jsonb
),
(
  'Location Result',
  'location_result',
  'Here are {count} numbers near: {location_name}, {country}

🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
🥇 *{nearby_location_1}*

+{country_code} {phone_number_1}
🔒 *Use password {location_name} - WhatsApp only* 🌟

🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟',
  '["count", "location_name", "country", "nearby_location_1", "country_code", "phone_number_1"]'::jsonb
);

-- Function to get template by type
CREATE OR REPLACE FUNCTION get_template_by_type(template_type TEXT)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  content TEXT,
  variables JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mt.id,
    mt.name,
    mt.content,
    mt.variables
  FROM message_templates mt
  WHERE mt.type = template_type 
    AND mt.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update template
CREATE OR REPLACE FUNCTION update_template(
  template_type TEXT,
  new_content TEXT,
  new_variables JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  template_exists BOOLEAN;
BEGIN
  -- Check if template exists
  SELECT EXISTS(SELECT 1 FROM message_templates WHERE type = template_type) INTO template_exists;
  
  IF template_exists THEN
    -- Update existing template
    UPDATE message_templates 
    SET 
      content = new_content,
      variables = COALESCE(new_variables, variables),
      updated_at = NOW()
    WHERE type = template_type;
    RETURN true;
  ELSE
    -- Insert new template
    INSERT INTO message_templates (name, type, content, variables)
    VALUES (
      INITCAP(REPLACE(template_type, '_', ' ')),
      template_type,
      new_content,
      COALESCE(new_variables, '[]'::jsonb)
    );
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read templates
CREATE POLICY "Allow authenticated users to read templates"
  ON message_templates FOR SELECT
  TO authenticated
  USING (true);

-- Allow admin users to manage templates
CREATE POLICY "Allow admin users to manage templates"
  ON message_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.telegram_user_id = auth.jwt() ->> 'sub'
        AND users.is_admin = true
    )
  );
