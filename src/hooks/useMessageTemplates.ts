
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MessageTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  variables: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMessageTemplates = () => {
  return useQuery({
    queryKey: ['message_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }
      
      return data as MessageTemplate[];
    },
  });
};

export const useTemplateByType = (type: string) => {
  return useQuery({
    queryKey: ['message_template', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_template_by_type', { template_type: type });
      
      if (error) {
        console.error('Error fetching template by type:', error);
        throw error;
      }
      
      return data?.[0] as MessageTemplate | null;
    },
  });
};

// Helper function to replace variables in template content
export const replaceTemplateVariables = (
  content: string, 
  variables: Record<string, string | number>
): string => {
  let result = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(value));
  });
  
  return result;
};
