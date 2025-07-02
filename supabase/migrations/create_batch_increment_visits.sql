-- Create function for batch incrementing visit counts
-- This function atomically increments visit counts for multiple locations

CREATE OR REPLACE FUNCTION batch_increment_visits(location_ids integer[])
RETURNS void AS $$
BEGIN
  -- Update visit counts for all provided location IDs in a single transaction
  UPDATE locations 
  SET visits = COALESCE(visits, 0) + 1,
      updated_at = NOW()
  WHERE id = ANY(location_ids)
    AND active = true;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION batch_increment_visits(integer[]) IS 
'Atomically increments visit counts for multiple locations by their IDs';
