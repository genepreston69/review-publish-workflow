
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { stripColorsFromPolicyFields } from '@/utils/colorUtils';

interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  policy_text: string | null;
  procedure: string | null;
  purpose: string | null;
  reviewer: string | null;
  status: string | null;
  created_at: string;
}

export const usePolicies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const { toast } = useToast();
  const { userRole } = useAuth();

  const isSuperAdmin = userRole === 'super-admin';

  const fetchPolicies = async () => {
    try {
      setIsLoadingPolicies(true);
      const { data, error } = await supabase
        .from('Policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching policies:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load policies.",
        });
      } else {
        setPolicies(data || []);
      }
    } catch (error) {
      console.error('Error in fetchPolicies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  const updatePolicyStatus = async (policyId: string, newStatus: string) => {
    try {
      // If publishing, we need to strip colors from the content
      let updateData: any = { status: newStatus };
      
      if (newStatus === 'published') {
        // First, get the current policy data
        const { data: currentPolicy, error: fetchError } = await supabase
          .from('Policies')
          .select('purpose, policy_text, procedure')
          .eq('id', policyId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        // Strip colors from all content fields
        const cleanedFields = stripColorsFromPolicyFields(currentPolicy);
        updateData = {
          ...updateData,
          ...cleanedFields
        };
      }

      const { error } = await supabase
        .from('Policies')
        .update(updateData)
        .eq('id', policyId);

      if (error) {
        console.error('Error updating policy status:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update policy status.",
        });
        return;
      }

      const statusMessage = newStatus === 'published' 
        ? "Policy published successfully. All colors have been removed from the content."
        : `Policy status updated to ${newStatus}.`;

      toast({
        title: "Success",
        description: statusMessage,
      });

      // Refresh the policies list
      fetchPolicies();
    } catch (error) {
      console.error('Error updating policy status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  const deletePolicy = async (policyId: string) => {
    try {
      const { error } = await supabase
        .from('Policies')
        .delete()
        .eq('id', policyId);

      if (error) {
        console.error('Error deleting policy:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete policy.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Policy deleted successfully.",
      });

      // Refresh the policies list
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return {
    policies,
    isLoadingPolicies,
    updatePolicyStatus,
    deletePolicy,
    isSuperAdmin,
    fetchPolicies,
  };
};
