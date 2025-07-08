
-- Step 1: Create user roles system
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user', 'blocked');

-- Create user_roles table to link users with roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, check_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = has_role.user_id 
        AND role = check_role
    );
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT role FROM public.user_roles 
    WHERE user_roles.user_id = get_user_role.user_id
    ORDER BY 
        CASE role
            WHEN 'admin' THEN 1
            WHEN 'manager' THEN 2
            WHEN 'user' THEN 3
            WHEN 'blocked' THEN 4
        END
    LIMIT 1;
$$;

-- RLS Policies for user_roles
CREATE POLICY "Authenticated users can view user roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage all user roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view user roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));

-- Add default admin role (replace with actual admin user ID when known)
-- This creates the first admin user - update the user_id with real admin telegram user
INSERT INTO public.user_roles (user_id, role, assigned_at) 
SELECT id, 'admin'::app_role, NOW() 
FROM telegram_users 
WHERE telegram_id = '12345678'  -- Replace with actual admin telegram_id
ON CONFLICT (user_id, role) DO NOTHING;

-- Add requests_today column to telegram_users for daily limits tracking
ALTER TABLE public.telegram_users 
ADD COLUMN IF NOT EXISTS requests_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_request_date DATE DEFAULT CURRENT_DATE;

-- Function to reset daily request counts
CREATE OR REPLACE FUNCTION public.reset_daily_requests()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE telegram_users 
    SET requests_today = 0, last_request_date = CURRENT_DATE
    WHERE last_request_date < CURRENT_DATE;
END;
$$;
