
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useFormNumberGeneration(formType: string) {
  return useQuery({
    queryKey: ['form-number', formType],
    queryFn: async () => {
      if (!formType) return null;
      
      const { data, error } = await supabase.rpc('generate_next_form_number', {
        f_form_type: formType
      });

      if (error) {
        console.error('Error generating form number:', error);
        throw error;
      }

      return data;
    },
    enabled: !!formType,
  });
}
