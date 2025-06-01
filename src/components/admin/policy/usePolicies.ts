import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { stripColorsFromPolicyFields } from '@/utils/colorUtils';
import { Policy } from './types';

export const usePolicies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const { toast } = useToast();
  const { userRole, currentUser } = useAuth();

  const isSuperAdmin = userRole === 'super-admin';

  const fetchPolicies = async () => {
    try {
      setIsLoadingPolicies(true);
      const { data, error } = await supabase
        .from('Policies')
        .select(`
          *,
          creator:creator_id(id, name, email),
          publisher:publisher_id(id, name, email)
        `)
        .is('archived_at', null) // Only show non-archived policies
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

  const updatePolicyStatus = async (policyId: string, newStatus: string, reviewerComment?: string) => {
    try {
      if (!currentUser) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to update policies.",
        });
        return;
      }

      // Get current policy to check creator and parent info
      const { data: currentPolicy, error: fetchError } = await supabase
        .from('Policies')
        .select('creator_id, status, parent_policy_id, archived_at')
        .eq('id', policyId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Enforce maker/checker rule for publishing
      if (newStatus === 'published' && currentPolicy.creator_id === currentUser.id) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You cannot publish a policy you created. Another reviewer must publish it.",
        });
        return;
      }

      // Check permissions for status changes
      const canPublish = userRole === 'publish' || userRole === 'super-admin';
      if ((newStatus === 'published' || newStatus === 'under-review') && !canPublish) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to perform this action.",
        });
        return;
      }

      let updateData: any = { 
        status: newStatus,
        reviewer_comment: reviewerComment || null
      };
      
      // Handle restoration from archive
      if (newStatus === 'draft' && currentPolicy.archived_at) {
        updateData.archived_at = null;
        toast({
          title: "Success",
          description: "Policy restored from archive to draft status.",
        });
      }
      
      // Set publisher_id when publishing
      if (newStatus === 'published') {
        // Get publisher profile
        const { data: publisherProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          throw new Error('Could not fetch publisher profile');
        }

        updateData.publisher_id = publisherProfile.id;
        updateData.published_at = new Date().toISOString();

        // Strip colors from all content fields when publishing
        const { data: policyContent, error: contentError } = await supabase
          .from('Policies')
          .select('purpose, policy_text, procedure')
          .eq('id', policyId)
          .single();

        if (contentError) {
          throw contentError;
        }

        const cleanedFields = stripColorsFromPolicyFields(policyContent);
        updateData = {
          ...updateData,
          ...cleanedFields
        };

        // Archive old versions in the same policy family when publishing
        const parentPolicyId = currentPolicy.parent_policy_id || policyId;
        try {
          await supabase
            .from('Policies')
            .update({ archived_at: new Date().toISOString() })
            .or(`id.eq.${parentPolicyId},parent_policy_id.eq.${parentPolicyId}`)
            .neq('id', policyId)
            .eq('status', 'published');
          
          console.log('=== OLD PUBLISHED VERSIONS ARCHIVED ===');
        } catch (archiveError) {
          console.error('Error archiving old versions:', archiveError);
          // Don't fail the publish operation if archiving fails
        }
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

      let statusMessage = '';
      switch (newStatus) {
        case 'published':
          statusMessage = "Policy published successfully. All colors have been removed from the content and old versions archived.";
          break;
        case 'draft':
          statusMessage = currentPolicy.archived_at 
            ? "Policy restored from archive to draft status."
            : "Policy returned to draft status for editing.";
          break;
        case 'under-review':
          statusMessage = "Policy submitted for review.";
          break;
        case 'awaiting-changes':
          statusMessage = "Policy returned for changes. Creator has been notified.";
          break;
        default:
          statusMessage = `Policy status updated to ${newStatus}.`;
      }

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

  const archivePolicy = async (policyId: string) => {
    try {
      const { error } = await supabase
        .from('Policies')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', policyId);

      if (error) {
        console.error('Error archiving policy:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to archive policy.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Policy archived successfully.",
      });

      // Refresh the policies list
      fetchPolicies();
    } catch (error) {
      console.error('Error archiving policy:', error);
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
    archivePolicy,
    isSuperAdmin,
    fetchPolicies,
  };
};
