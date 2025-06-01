
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Form } from './FormSchema';

interface UseFormsOptions {
  statusFilter?: string[];
}

export function useForms(options: UseFormsOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { statusFilter } = options;

  const { data: forms = [], isLoading: isLoadingForms } = useQuery({
    queryKey: ['forms', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('Forms')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter at database level for better performance
      if (statusFilter && statusFilter.length > 0) {
        query = query.in('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching forms:', error);
        throw error;
      }

      return data as Form[];
    },
  });

  const updateFormStatusMutation = useMutation({
    mutationFn: async ({ formId, newStatus }: { formId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('Forms')
        .update({ status: newStatus })
        .eq('id', formId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({
        title: 'Success',
        description: 'Form status updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating form status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update form status',
        variant: 'destructive',
      });
    },
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      const { error } = await supabase
        .from('Forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete form',
        variant: 'destructive',
      });
    },
  });

  const updateFormStatus = (formId: string, newStatus: string) => {
    updateFormStatusMutation.mutate({ formId, newStatus });
  };

  const deleteForm = (formId: string) => {
    deleteFormMutation.mutate(formId);
  };

  return {
    forms,
    isLoadingForms,
    updateFormStatus,
    deleteForm,
    isSuperAdmin: true, // This should be derived from auth context
  };
}
