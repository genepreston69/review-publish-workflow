import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePolicyDuplication } from '@/hooks/usePolicyDuplication';

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
  parent_policy_id: string | null;
}

export function useFacilityPolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { archiveByPolicyNumber } = usePolicyDuplication();

  const fetchPolicies = async () => {
    try {
      console.log('=== FETCHING FACILITY POLICIES ===');
      const { data, error } = await supabase
        .from('Policies')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      console.log('=== FACILITY POLICIES RESPONSE ===', { data, error });

      if (error) {
        console.error('Error fetching policies:', error);
      } else {
        // Sort policies by policy number
        const sortedPolicies = (data || []).sort((a, b) => {
          // Handle null policy numbers by placing them at the end
          if (!a.policy_number && !b.policy_number) return 0;
          if (!a.policy_number) return 1;
          if (!b.policy_number) return -1;
          
          // Sort numerically if both are numbers, otherwise alphabetically
          const aNum = parseFloat(a.policy_number);
          const bNum = parseFloat(b.policy_number);
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          
          return a.policy_number.localeCompare(b.policy_number);
        });
        
        console.log('=== SORTED FACILITY POLICIES ===', sortedPolicies);
        setPolicies(sortedPolicies);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load policies.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePolicyStatus = async (policyId: string, newStatus: string) => {
    try {
      console.log('=== UPDATING POLICY STATUS ===', { policyId, newStatus });

      // If publishing, first find and archive old versions by policy number
      if (newStatus === 'published') {
        // Get the policy being published to find its policy number
        const { data: currentPolicy } = await supabase
          .from('Policies')
          .select('policy_number, parent_policy_id')
          .eq('id', policyId)
          .single();

        if (currentPolicy && currentPolicy.policy_number) {
          console.log('=== ARCHIVING POLICIES WITH SAME POLICY NUMBER ===', currentPolicy.policy_number);
          
          // Archive all other policies with the same policy number
          const { error: archiveError } = await supabase
            .from('Policies')
            .update({ archived_at: new Date().toISOString() })
            .eq('policy_number', currentPolicy.policy_number)
            .neq('id', policyId)
            .is('archived_at', null);

          if (archiveError) {
            console.error('Error archiving old versions by policy number:', archiveError);
          } else {
            console.log('=== SUCCESSFULLY ARCHIVED OLD VERSIONS ===');
          }
        }
      }

      const { error } = await supabase
        .from('Policies')
        .update({ status: newStatus })
        .eq('id', policyId);

      if (error) throw error;

      const statusMessage = newStatus === 'draft' 
        ? 'Policy returned to draft status for editing'
        : `Policy ${newStatus === 'published' ? 'published' : 'rejected'} successfully`;

      toast({
        title: "Success",
        description: statusMessage,
      });

      // Refresh policies
      fetchPolicies();
    } catch (error) {
      console.error('Error updating policy status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update policy status.",
      });
    }
  };

  const deletePolicy = async (policyId: string) => {
    try {
      const { error } = await supabase
        .from('Policies')
        .delete()
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Policy deleted successfully.",
      });

      // Refresh policies
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete policy.",
      });
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [toast]);

  return {
    policies,
    isLoading,
    updatePolicyStatus,
    deletePolicy,
    refetch: fetchPolicies
  };
}
