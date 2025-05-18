
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  rating: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  visits: number;
  active: boolean;
  contact?: string;  // Added property
  password?: string; // Added property
  info?: string;     // Added property
}

export type NewLocation = Omit<Location, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export const useLocations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>('all');

  // Fetch locations
  const { data: locations = [], isLoading, error } = useQuery({
    queryKey: ['locations', filter],
    queryFn: async () => {
      try {
        let query = supabase.from('locations').select('*');
        
        if (filter !== 'all') {
          query = query.eq('type', filter);
        }
        
        const { data, error } = await query.order('name');
        
        if (error) {
          toast.error(`Failed to load locations: ${error.message}`);
          throw new Error(`Failed to load locations: ${error.message}`);
        }
        
        return data as Location[];
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        toast.error(`Error: ${errorMessage}`);
        throw err;
      }
    },
  });

  // Add a new location
  const addLocation = useMutation({
    mutationFn: async (newLocation: NewLocation) => {
      try {
        // Include visits field in the location data
        const locationWithDefaults = {
          ...newLocation,
          lat: newLocation.lat || 0,
          lng: newLocation.lng || 0,
          visits: newLocation.visits || 0,
          created_by: user?.id,
        };
        
        const { data, error } = await supabase
          .from('locations')
          .insert(locationWithDefaults)
          .select();
        
        if (error) {
          toast.error(`Failed to add location: ${error.message}`);
          throw new Error(`Failed to add location: ${error.message}`);
        }
        
        return data[0];
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        toast.error(`Error: ${errorMessage}`);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location added successfully');
    },
  });

  // Update an existing location
  const updateLocation = useMutation({
    mutationFn: async ({ id, location }: { id: string; location: Partial<Location> }) => {
      try {
        // Ensure visits field is preserved if not provided
        const updateData = {
          ...location,
          lat: location.lat ?? 0,
          lng: location.lng ?? 0,
          visits: location.visits ?? 0,
        };
        
        const { data, error } = await supabase
          .from('locations')
          .update(updateData)
          .eq('id', id)
          .select();
        
        if (error) {
          toast.error(`Failed to update location: ${error.message}`);
          throw new Error(`Failed to update location: ${error.message}`);
        }
        
        return data[0];
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        toast.error(`Error: ${errorMessage}`);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location updated successfully');
    },
  });

  // Delete a location
  const deleteLocation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase.from('locations').delete().eq('id', id);
        
        if (error) {
          toast.error(`Failed to delete location: ${error.message}`);
          throw new Error(`Failed to delete location: ${error.message}`);
        }
        
        return id;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        toast.error(`Error: ${errorMessage}`);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
  });

  // Toggle location active status
  const toggleLocationStatus = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .update({ active })
          .eq('id', id)
          .select();
        
        if (error) {
          toast.error(`Failed to update location status: ${error.message}`);
          throw new Error(`Failed to update location status: ${error.message}`);
        }
        
        return data[0];
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        toast.error(`Error: ${errorMessage}`);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location status updated');
    },
  });

  return {
    locations,
    isLoading,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    toggleLocationStatus,
    filter,
    setFilter
  };
};
