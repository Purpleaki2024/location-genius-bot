-- Supabase RPC function to promote a user to admin
CREATE OR REPLACE FUNCTION promote_user(user_identifier TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET is_admin = TRUE
    WHERE telegram_id = user_identifier::BIGINT OR LOWER(username) = LOWER(user_identifier);
END;
$$ LANGUAGE plpgsql;
