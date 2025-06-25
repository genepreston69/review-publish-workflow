import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Policy, toPolicyType } from './types';

export const usePolicies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userRole } = useAuth();

  const isSuperAdmin = userRole === 'super-admin';

  const fetchPolicies = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('=== FETCHING POLICIES ===');

      const { data, error } = await supabase
        .from('Policies')
        .select(`
          *,
          creator:profiles!Policies_creator_id_fkey(id, name, email),
          publisher:profiles!Policies_publisher_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching policies:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load policies.",
        });
        setPolicies([]);
        return;
      }

      console.log('=== POLICIES FETCHED ===', data?.length || 0);
      // Convert to typed policies
      const typedPolicies = (data || []).map(toPolicyType);
      setPolicies(typedPolicies);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading policies.",
      });
      setPolicies([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createPolicy = async (newPolicy: Omit<Policy, 'id' | 'created_at'>) => {
    try {
      console.log('=== CREATING POLICY ===', newPolicy);
      setIsLoading(true);

      const { data, error } = await supabase
        .from('Policies')
        .insert([newPolicy])
        .select('*');

      if (error) {
        console.error('Error creating policy:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create policy.",
        });
        return false;
      }

      console.log('=== POLICY CREATED SUCCESSFULLY ===', data);
      toast({
        title: "Success",
        description: "Policy created successfully.",
      });
      await fetchPolicies();
      return true;
    } catch (error) {
      console.error('Error creating policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while creating the policy.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePolicyStatus = async (policyId: string, newStatus: string, comment?: string) => {
    try {
      console.log('=== UPDATING POLICY STATUS ===', { policyId, newStatus, comment });
      setIsLoading(true);

      const { error } = await supabase
        .from('Policies')
        .update({ status: newStatus, reviewer_comment: comment })
        .eq('id', policyId);

      if (error) {
        console.error('Error updating policy status:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update policy status.",
        });
        return false;
      }

      console.log('=== POLICY STATUS UPDATED SUCCESSFULLY ===');
      toast({
        title: "Success",
        description: "Policy status updated successfully.",
      });
      await fetchPolicies();
      return true;
    } catch (error) {
      console.error('Error updating policy status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating policy status.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePolicy = async (policyId: string) => {
    try {
      console.log('=== DELETING POLICY ===', policyId);
      setIsLoading(true);

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
        return false;
      }

      console.log('=== POLICY DELETED SUCCESSFULLY ===');
      toast({
        title: "Success",
        description: "Policy deleted successfully.",
      });
      await fetchPolicies();
      return true;
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while deleting the policy.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const archivePolicy = async (policyId: string) => {
    try {
      console.log('=== ARCHIVING POLICY ===', policyId);
      setIsLoading(true);

      const { error } = await supabase
        .from('Policies')
        .update({ 
          status: 'archived',
          archived_at: new Date().toISOString()
        })
        .eq('id', policyId);

      if (error) {
        console.error('Error archiving policy:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to archive policy.",
        });
        return false;
      }

      console.log('=== POLICY ARCHIVED SUCCESSFULLY ===');
      toast({
        title: "Success",
        description: "Policy archived successfully.",
      });
      await fetchPolicies();
      return true;
    } catch (error) {
      console.error('Error archiving policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while archiving the policy.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getDraftPolicies = async (): Promise<Policy[]> => {
    try {
      console.log('=== GETTING DRAFT POLICIES ===');
      setIsLoading(true);

      const { data, error } = await supabase
        .from('Policies')
        .select(`
          *,
          creator:profiles!Policies_creator_id_fkey(id, name, email),
          publisher:profiles!Policies_publisher_id_fkey(id, name, email)
        `)
        .eq('status', 'draft');

      if (error) {
        console.error('Error getting draft policies:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load draft policies.",
        });
        return [];
      }

      console.log('=== DRAFT POLICIES FETCHED ===', data?.length || 0);
      return data ? data.map(toPolicyType) : [];
    } catch (error) {
      console.error('Error getting draft policies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading draft policies.",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getPublishedPolicies = async (): Promise<Policy[]> => {
    try {
      console.log('=== GETTING PUBLISHED POLICIES ===');
      setIsLoading(true);

      const { data, error } = await supabase
        .from('Policies')
        .select(`
          *,
          creator:profiles!Policies_creator_id_fkey(id, name, email),
          publisher:profiles!Policies_publisher_id_fkey(id, name, email)
        `)
        .eq('status', 'published');

      if (error) {
        console.error('Error getting published policies:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load published policies.",
        });
        return [];
      }

      console.log('=== PUBLISHED POLICIES FETCHED ===', data?.length || 0);
      return data ? data.map(toPolicyType) : [];
    } catch (error) {
      console.error('Error getting published policies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading published policies.",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getArchivedPolicies = async (): Promise<Policy[]> => {
    try {
      console.log('=== GETTING ARCHIVED POLICIES ===');
      setIsLoading(true);

      const { data, error } = await supabase
        .from('Policies')
        .select(`
          *,
          creator:profiles!Policies_creator_id_fkey(id, name, email),
          publisher:profiles!Policies_publisher_id_fkey(id, name, email)
        `)
        .eq('status', 'archived');

      if (error) {
        console.error('Error getting archived policies:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load archived policies.",
        });
        return [];
      }

      console.log('=== ARCHIVED POLICIES FETCHED ===', data?.length || 0);
      return data ? data.map(toPolicyType) : [];
    } catch (error) {
      console.error('Error getting archived policies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading archived policies.",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getPoliciesUnderReview = async (): Promise<Policy[]> => {
    try {
      console.log('=== GETTING POLICIES UNDER REVIEW ===');
      setIsLoading(true);

      const { data, error } = await supabase
        .from('Policies')
        .select(`
          *,
          creator:profiles!Policies_creator_id_fkey(id, name, email),
          publisher:profiles!Policies_publisher_id_fkey(id, name, email)
        `)
        .or('status.eq.under review,status.eq.under-review');

      if (error) {
        console.error('Error getting policies under review:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load policies under review.",
        });
        return [];
      }

      console.log('=== POLICIES UNDER REVIEW FETCHED ===', data?.length || 0);
      return data ? data.map(toPolicyType) : [];
    } catch (error) {
      console.error('Error getting policies under review:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading policies under review.",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    policies,
    isLoading,
    isLoadingPolicies: isLoading, // Provide both names for compatibility
    isSuperAdmin,
    fetchPolicies,
    createPolicy,
    updatePolicyStatus,
    deletePolicy,
    archivePolicy,
    getDraftPolicies,
    getPublishedPolicies,
    getArchivedPolicies,
    getPoliciesUnderReview,
  };
};
