
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function usePolicyDuplication() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const duplicatePolicyForUpdate = async (originalPolicyId: string): Promise<string | null> => {
    if (!user) {
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
        creator_id: user.id, // Set current user as creator
        status: 'draft', // Always set to draft for updates
        parent_policy_id: originalPolicy.parent_policy_id || originalPolicyId, // Link to the original or its parent
        reviewer: user.email,
      };

      const { data: newPolicy, error: createError } = await supabase
        .from('Policies')
        .insert(newPolicyData)
        .select()
        .single();

      if (createError || !newPolicy) {
        console.error('Error creating new policy:', createError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create new policy version.",
        });
        return null;
      }

      console.log('=== NEW POLICY CREATED ===', newPolicy);

      toast({
        title: "Success",
        description: `New draft created for policy ${originalPolicy.policy_number}. You can now edit this version.`,
      });

      return newPolicy.id;
    } catch (error) {
      console.error('Error in duplicatePolicyForUpdate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while creating the policy update.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const archiveByPolicyNumber = async (policyNumber: string, excludeId?: string) => {
    try {
      let query = supabase
        .from('Policies')
        .update({ 
          archived_at: new Date().toISOString(),
          status: 'archived'
        })
        .eq('policy_number', policyNumber)
        .neq('status', 'archived');

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { error } = await query;

      if (error) {
        console.error('Error archiving policies by number:', error);
        throw error;
      }

      console.log('=== ARCHIVED OLD VERSIONS OF POLICY ===', policyNumber);
    } catch (error) {
      console.error('Error in archiveByPolicyNumber:', error);
      throw error;
    }
  };

  return {
    duplicatePolicyForUpdate,
    archiveByPolicyNumber,
    isLoading
  };
}
