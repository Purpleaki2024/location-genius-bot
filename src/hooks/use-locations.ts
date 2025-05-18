
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
      let query = supabase.from('locations').select('*');
      
      if (filter !== 'all') {
        query = query.eq('type', filter);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        toast.error('Failed to load locations');
        throw new Error('Failed to load locations');
      }
      
      return data as Location[];
    },
  });

  // Add a new location
  const addLocation = useMutation({
    mutationFn: async (newLocation: NewLocation) => {
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
        toast.error('Failed to add location');
        throw new Error('Failed to add location');
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location added successfully');
    },
  });

  // Update an existing location
  const updateLocation = useMutation({
    mutationFn: async ({ id, location }: { id: string; location: Partial<Location> }) => {
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
        toast.error('Failed to update location');
        throw new Error('Failed to update location');
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location updated successfully');
    },
  });

  // Delete a location
  const deleteLocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('locations').delete().eq('id', id);
      
      if (error) {
        toast.error('Failed to delete location');
        throw new Error('Failed to delete location');
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
  });

  // Toggle location active status
  const toggleLocationStatus = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await supabase
        .from('locations')
        .update({ active })
        .eq('id', id)
        .select();
      
      if (error) {
        toast.error('Failed to update location status');
        throw new Error('Failed to update location status');
      }
      
      return data[0];
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
