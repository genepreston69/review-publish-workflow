
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function usePolicyDuplication() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const duplicatePolicyForUpdate = async (originalPolicyId: string): Promise<string | null> => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to update policies.",
      });
      return null;
    }

    setIsLoading(true);
    try {
      console.log('=== DUPLICATING POLICY FOR UPDATE ===', originalPolicyId);

      // Get the original policy
      const { data: originalPolicy, error: fetchError } = await supabase
        .from('Policies')
        .select('*')
        .eq('id', originalPolicyId)
        .single();

      if (fetchError || !originalPolicy) {
        console.error('Error fetching original policy:', fetchError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load the original policy.",
        });
        return null;
      }

      console.log('=== ORIGINAL POLICY FETCHED ===', originalPolicy);

      // Archive the current published policy before creating new version
      if (originalPolicy.status === 'published') {
        console.log('=== ARCHIVING CURRENT PUBLISHED POLICY ===', originalPolicyId);
        const { error: archiveError } = await supabase
          .from('Policies')
          .update({ 
            archived_at: new Date().toISOString(),
            status: 'archived'
          })
          .eq('id', originalPolicyId);

        if (archiveError) {
          console.error('Error archiving current policy:', archiveError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to archive the current policy.",
          });
          return null;
        }
        console.log('=== CURRENT POLICY ARCHIVED SUCCESSFULLY ===');
      }

      // Create a new policy as a copy with draft status
      const newPolicyData = {
        name: originalPolicy.name,
        policy_type: originalPolicy.policy_type,
        policy_number: originalPolicy.policy_number, // Keep the same policy number
        purpose: originalPolicy.purpose,
        policy_text: originalPolicy.policy_text,
        procedure: originalPolicy.procedure,
        creator_id: currentUser.id, // Set current user as creator
        status: 'draft', // Always set to draft for updates
        parent_policy_id: originalPolicy.parent_policy_id || originalPolicyId, // Link to the original or its parent
        reviewer: null, // Reset reviewer
        reviewer_comment: null, // Reset reviewer comment
        publisher_id: null, // Reset publisher
        published_at: null, // Reset published date
      };

      const { data: newPolicy, error: createError } = await supabase
        .from('Policies')
        .insert(newPolicyData)
        .select()
        .single();

      if (createError || !newPolicy) {
        console.error('Error creating new policy version:', createError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create new policy version.",
        });
        return null;
      }

      console.log('=== NEW POLICY VERSION CREATED ===', newPolicy);

      toast({
        title: "Success",
        description: "New draft version created for editing. The previous published version has been archived.",
      });

      return newPolicy.id;
    } catch (error) {
      console.error('Error in duplicatePolicyForUpdate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while creating the policy version.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const archiveOldVersions = async (parentPolicyId: string, excludePolicyId: string) => {
    try {
      console.log('=== ARCHIVING OLD VERSIONS BY PARENT ===', { parentPolicyId, excludePolicyId });

      const { error } = await supabase
        .from('Policies')
        .update({ 
          archived_at: new Date().toISOString(),
          status: 'archived'
        })
        .or(`id.eq.${parentPolicyId},parent_policy_id.eq.${parentPolicyId}`)
        .neq('id', excludePolicyId)
        .is('archived_at', null);

      if (error) {
        console.error('Error archiving old versions by parent:', error);
        throw error;
      }

      console.log('=== OLD VERSIONS ARCHIVED SUCCESSFULLY BY PARENT ===');
    } catch (error) {
      console.error('Error in archiveOldVersions:', error);
      throw error;
    }
  };

  const archiveByPolicyNumber = async (policyNumber: string, excludePolicyId: string) => {
    try {
      console.log('=== ARCHIVING BY POLICY NUMBER ===', { policyNumber, excludePolicyId });

      const { error } = await supabase
        .from('Policies')
        .update({ 
          archived_at: new Date().toISOString(),
          status: 'archived'
        })
        .eq('policy_number', policyNumber)
        .neq('id', excludePolicyId)
        .is('archived_at', null);

      if (error) {
        console.error('Error archiving by policy number:', error);
        throw error;
      }

      console.log('=== POLICIES ARCHIVED SUCCESSFULLY BY POLICY NUMBER ===');
    } catch (error) {
      console.error('Error in archiveByPolicyNumber:', error);
      throw error;
    }
  };

  return {
    duplicatePolicyForUpdate,
    archiveOldVersions,
    archiveByPolicyNumber,
    isLoading,
  };
}
