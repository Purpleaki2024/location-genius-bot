
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TelegramUser {
  id: string;
  telegram_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  first_seen: string | null;
  last_seen: string | null;
  requests_today: number | null;
  last_request_date: string | null;
  role?: string;
}

export const useTelegramUsers = () => {
  return useQuery({
    queryKey: ['telegram_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telegram_users')
        .select(`
          *,
          user_roles!inner(role)
        `)
        .order('last_seen', { ascending: false });
      
      if (error) {
        console.error('Error fetching telegram users:', error);
        throw error;
      }
      
      // Transform data to include role
      return data?.map(user => ({
        ...user,
        role: Array.isArray(user.user_roles) ? user.user_roles[0]?.role : user.user_roles?.role || 'user'
      })) as TelegramUser[];
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // First check if user has existing role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: role as any })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role as any
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram_users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, block }: { userId: string; block: boolean }) => {
      const role = block ? 'blocked' : 'user';
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role as any
        });
      
      if (error) throw error;
    },
    onSuccess: (_, { block }) => {
      queryClient.invalidateQueries({ queryKey: ['telegram_users'] });
      toast.success(`User ${block ? 'blocked' : 'unblocked'} successfully`);
    },
    onError: (error) => {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    },
  });
};
