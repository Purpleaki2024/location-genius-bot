
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
  contact?: string;
  password?: string;
  info?: string;
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
        console.log("Fetching locations with filter:", filter);
        
        let query = supabase.from('locations').select('*');
        
        if (filter !== 'all') {
          query = query.eq('type', filter);
        }
        
        const { data, error } = await query.order('name');
        
        console.log("Supabase response:", { data, error });
        
        if (error) {
          console.error("Supabase error:", error);
          throw new Error(`Failed to load locations: ${error.message}`);
        }
        
        console.log("Successfully fetched locations:", data?.length || 0);
        return data as Location[] || [];
      } catch (err) {
        console.error("useLocations error:", err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        throw new Error(errorMessage);
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Add a new location
  const addLocation = useMutation({
    mutationFn: async (newLocation: NewLocation) => {
      try {
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
          throw new Error(`Failed to add location: ${error.message}`);
        }
        
        return data[0];
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location added successfully');
    },
    onError: (error) => {
      console.error("Add location error:", error);
      toast.error(`Error: ${error.message}`);
    }
  });

  // Update an existing location
  const updateLocation = useMutation({
    mutationFn: async ({ id, location }: { id: string; location: Partial<Location> }) => {
      try {
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
          throw new Error(`Failed to update location: ${error.message}`);
        }
        
        return data[0];
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location updated successfully');
    },
    onError: (error) => {
      console.error("Update location error:", error);
      toast.error(`Error: ${error.message}`);
    }
  });

  // Delete a location
  const deleteLocation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase.from('locations').delete().eq('id', id);
        
        if (error) {
          throw new Error(`Failed to delete location: ${error.message}`);
        }
        
        return id;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
    onError: (error) => {
      console.error("Delete location error:", error);
      toast.error(`Error: ${error.message}`);
    }
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
          throw new Error(`Failed to update location status: ${error.message}`);
        }
        
        return data[0];
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location status updated');
    },
    onError: (error) => {
      console.error("Toggle status error:", error);
      toast.error(`Error: ${error.message}`);
    }
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
