
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  policy_type: string | null;
  created_at: string;
  parent_policy_id: string | null;
}

export const usePolicyDuplication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getNextVersionNumber = async (parentPolicyId: string | null): Promise<string> => {
    // If no parent, this is version 1.0
    if (!parentPolicyId) {
      return '1.0';
    }

    // Get all versions of this policy family
    const { data: versions, error } = await supabase
      .from('Policies')
      .select('id, name')
      .or(`id.eq.${parentPolicyId},parent_policy_id.eq.${parentPolicyId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching versions:', error);
      return '1.1';
    }

    // Extract version numbers from policy names
    const versionNumbers = versions
      .map(policy => {
        const match = policy.name?.match(/v(\d+)\.(\d+)$/);
        if (match) {
          return { major: parseInt(match[1]), minor: parseInt(match[2]) };
        }
        return null;
      })
      .filter(Boolean);

    if (versionNumbers.length === 0) {
      return '1.1';
    }

    // Find the highest version
    const latestVersion = versionNumbers.reduce((latest, current) => {
      if (!latest) return current;
      if (current!.major > latest.major) return current;
      if (current!.major === latest.major && current!.minor > latest.minor) return current;
      return latest;
    });

    // Increment minor version
    return `${latestVersion!.major}.${latestVersion!.minor + 1}`;
  };

  const duplicatePolicyForUpdate = async (policyId: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      console.log('=== STARTING POLICY DUPLICATION WITH VERSIONING ===', policyId);
      
      // First, fetch the original policy
      const { data: originalPolicy, error: fetchError } = await supabase
        .from('Policies')
        .select('*')
        .eq('id', policyId)
        .single();

      if (fetchError) {
        console.error('Error fetching original policy:', fetchError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch original policy for duplication.",
        });
        return null;
      }

      console.log('=== ORIGINAL POLICY FETCHED ===', originalPolicy);

      // Determine the parent policy ID and get next version number
      const parentPolicyId = originalPolicy.parent_policy_id || originalPolicy.id;
      const nextVersion = await getNextVersionNumber(parentPolicyId);
      
      // Create version suffix for the name
      const baseName = originalPolicy.name?.replace(/\sv\d+\.\d+$/, '') || 'Policy';
      const versionedName = `${baseName} v${nextVersion}`;

      // Create a new policy with the same content but as draft with version info
      const duplicatedPolicy = {
        name: versionedName,
        policy_number: originalPolicy.policy_number,
        policy_text: originalPolicy.policy_text,
        procedure: originalPolicy.procedure,
        purpose: originalPolicy.purpose,
        reviewer: originalPolicy.reviewer,
        policy_type: originalPolicy.policy_type,
        status: 'draft',
        parent_policy_id: parentPolicyId
      };

      console.log('=== CREATING VERSIONED POLICY ===', duplicatedPolicy);

      const { data: newPolicy, error: insertError } = await supabase
        .from('Policies')
        .insert([duplicatedPolicy])
        .select('id, name')
        .single();

      if (insertError) {
        console.error('Error creating policy copy:', insertError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create policy copy for updating.",
        });
        return null;
      }

      console.log('=== NEW VERSIONED POLICY CREATED ===', newPolicy);

      toast({
        title: "Success",
        description: `Policy duplicated as ${versionedName}. You can now edit the new version.`,
      });

      return newPolicy.id;
    } catch (error) {
      console.error('Error in duplicatePolicyForUpdate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while duplicating the policy.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const archiveOldVersions = async (parentPolicyId: string, excludePolicyId: string) => {
    try {
      console.log('=== ARCHIVING OLD VERSIONS ===', { parentPolicyId, excludePolicyId });

      // Archive all other versions in this policy family except the newly published one
      const { error } = await supabase
        .from('Policies')
        .update({ archived_at: new Date().toISOString() })
        .or(`id.eq.${parentPolicyId},parent_policy_id.eq.${parentPolicyId}`)
        .neq('id', excludePolicyId)
        .is('archived_at', null);

      if (error) {
        console.error('Error archiving old versions:', error);
        throw error;
      }

      console.log('=== OLD VERSIONS ARCHIVED SUCCESSFULLY ===');
    } catch (error) {
      console.error('Error in archiveOldVersions:', error);
      throw error;
    }
  };

  return {
    duplicatePolicyForUpdate,
    archiveOldVersions,
    isLoading
  };
};
