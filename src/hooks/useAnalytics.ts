
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserActivityStats {
  date: string;
  active_users: number;
  total_commands: number;
  avg_session_duration: number;
}

export interface LocationSearchStats {
  date: string;
  total_searches: number;
  successful_searches: number;
  avg_response_time: number;
  unique_users: number;
}

export interface BotPerformanceStats {
  date: string;
  total_requests: number;
  error_count: number;
  avg_duration_ms: number;
  success_rate: number;
}

export const useUserActivityStats = (daysBack: number = 7) => {
  return useQuery({
    queryKey: ['user_activity_stats', daysBack],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_activity_stats', {
        days_back: daysBack
      });
      
      if (error) {
        console.error('Error fetching user activity stats:', error);
        throw error;
      }
      
      return data as UserActivityStats[];
    },
  });
};

export const useLocationSearchStats = (daysBack: number = 7) => {
  return useQuery({
    queryKey: ['location_search_stats', daysBack],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_location_search_stats', {
        days_back: daysBack
      });
      
      if (error) {
        console.error('Error fetching location search stats:', error);
        throw error;
      }
      
      return data as LocationSearchStats[];
    },
  });
};

export const useBotPerformanceStats = (daysBack: number = 7) => {
  return useQuery({
    queryKey: ['bot_performance_stats', daysBack],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_bot_performance_stats', {
        days_back: daysBack
      });
      
      if (error) {
        console.error('Error fetching bot performance stats:', error);
        throw error;
      }
      
      return data as BotPerformanceStats[];
    },
  });
};

export const useBotHealthChecks = () => {
  return useQuery({
    queryKey: ['bot_health_checks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bot_health_checks')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching bot health checks:', error);
        throw error;
      }
      
      return data;
    },
  });
};
