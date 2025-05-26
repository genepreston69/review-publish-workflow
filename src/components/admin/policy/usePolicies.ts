
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

export function usePolicies() {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);

  const isEditor = userRole === 'edit';
  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isSuperAdmin = userRole === 'super-admin';

  useEffect(() => {
    async function fetchPolicies() {
      if (!currentUser || !userRole) return;
      
      try {
        setIsLoadingPolicies(true);
        console.log('=== FETCHING POLICIES FOR CREATE PAGE ===', userRole);
        
        let query = supabase.from('Policies').select('*');
        
        if (isEditor) {
          // Editors see their own draft policies
          query = query.eq('reviewer', currentUser.email).eq('status', 'draft');
        } else if (canPublish) {
          // Publishers and super-admins see policies that need review
          query = query.in('status', ['draft', 'under-review', 'under review']);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching policies:', error);
        } else {
          console.log('=== POLICIES FOR CREATE PAGE ===', data);
          setPolicies(data || []);
        }
      } catch (error) {
        console.error('Error fetching policies:', error);
      } finally {
        setIsLoadingPolicies(false);
      }
    }

    fetchPolicies();
  }, [currentUser, userRole, isEditor, canPublish]);

  const updatePolicyStatus = async (policyId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('Policies')
        .update({ status: newStatus })
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Policy ${newStatus === 'active' ? 'published' : 'rejected'} successfully.`,
      });

      // Refresh policies
      setPolicies(prev => prev.filter(p => p.id !== policyId));
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
    if (!isSuperAdmin) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Only super admins can delete policies.",
      });
      return;
    }

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

      // Remove from local state
      setPolicies(prev => prev.filter(p => p.id !== policyId));
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete policy.",
      });
    }
  };

  const addPolicy = (newPolicy: Policy) => {
    setPolicies(prev => [newPolicy, ...prev]);
  };

  return {
    policies,
    isLoadingPolicies,
    updatePolicyStatus,
    deletePolicy,
    addPolicy,
    isEditor,
    canPublish,
    isSuperAdmin
  };
}
