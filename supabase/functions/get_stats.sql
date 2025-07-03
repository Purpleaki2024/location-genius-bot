-- Supabase RPC function to gather bot statistics
CREATE OR REPLACE FUNCTION get_stats()
RETURNS TABLE (
    total_users INT,
    admin_users INT,
    total_locations INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE is_admin = TRUE) AS admin_users,
        (SELECT COUNT(*) FROM locations) AS total_locations
    FROM users;
END;
$$ LANGUAGE plpgsql;
