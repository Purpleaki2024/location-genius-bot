
-- Add foreign key constraint to link user_roles to telegram_users
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.telegram_users(id) ON DELETE CASCADE;
