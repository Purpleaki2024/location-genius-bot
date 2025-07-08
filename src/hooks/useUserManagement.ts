
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserWithRole {
  id: string;
  telegram_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  first_seen: string | null;
  last_seen: string | null;
  requests_today: number | null;
  last_request_date: string | null;
  role: 'admin' | 'manager' | 'user' | 'blocked';
  join_date: string;
}

export const useUserManagement = (searchTerm?: string, roleFilter?: string) => {
  return useQuery({
    queryKey: ['user_management', searchTerm, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('telegram_users')
        .select(`
          *,
          user_roles(role)
        `)
        .order('last_seen', { ascending: false });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,telegram_id.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      // Transform and filter data
      let users = data?.map(user => ({
        ...user,
        role: Array.isArray(user.user_roles) ? user.user_roles[0]?.role : user.user_roles?.role || 'user',
        join_date: user.first_seen || user.id
      })) as UserWithRole[];

      // Apply role filter
      if (roleFilter && roleFilter !== 'all') {
        users = users.filter(user => user.role === roleFilter);
      }

      return users;
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role as any
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_management'] });
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
      queryClient.invalidateQueries({ queryKey: ['user_management'] });
      queryClient.invalidateQueries({ queryKey: ['telegram_users'] });
      toast.success(`User ${block ? 'blocked' : 'unblocked'} successfully`);
    },
    onError: (error) => {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    },
  });
};

export const useBulkUserOperations = () => {
  const queryClient = useQueryClient();

  const updateMultipleRoles = useMutation({
    mutationFn: async ({ userIds, role }: { userIds: string[]; role: string }) => {
      const updates = userIds.map(userId => ({
        user_id: userId,
        role: role as any
      }));

      const { error } = await supabase
        .from('user_roles')
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_management'] });
      queryClient.invalidateQueries({ queryKey: ['telegram_users'] });
      toast.success('Bulk role update completed');
    },
    onError: (error) => {
      console.error('Error in bulk role update:', error);
      toast.error('Failed to update user roles');
    },
  });

  return { updateMultipleRoles };
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user_stats'],
    queryFn: async () => {
      // Get total users count
      const { data: totalUsers, error: totalError } = await supabase
        .from('telegram_users')
        .select('id', { count: 'exact' });

      if (totalError) throw totalError;

      // Get active users today
      const today = new Date().toISOString().split('T')[0];
      const { data: activeToday, error: activeError } = await supabase
        .from('telegram_users')
        .select('id', { count: 'exact' })
        .gte('last_seen', today);

      if (activeError) throw activeError;

      // Get new users this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: newThisWeek, error: newError } = await supabase
        .from('telegram_users')
        .select('id', { count: 'exact' })
        .gte('first_seen', weekAgo.toISOString());

      if (newError) throw newError;

      // Get role distribution
      const { data: roleDistribution, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .order('role');

      if (roleError) throw roleError;

      const roleStats = roleDistribution?.reduce((acc, { role }) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        totalUsers: totalUsers?.length || 0,
        activeToday: activeToday?.length || 0,
        newThisWeek: newThisWeek?.length || 0,
        roleDistribution: roleStats
      };
    },
  });
};
