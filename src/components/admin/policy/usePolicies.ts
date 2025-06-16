import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { stripColorsFromPolicyFields } from '@/utils/colorUtils';
import { notifyPolicyStatusChange, notifyPolicyComment } from '@/utils/notificationHelpers';
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
        setPolicies([]); // Set empty array on error
      } else {
        setPolicies(data || []);
      }
    } catch (error) {
      console.error('Error in fetchPolicies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading policies.",
      });
      setPolicies([]); // Set empty array on error
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  const updatePolicyStatus = async (policyId: string, newStatus: string, reviewerComment?: string) => {
    try {
      console.log('=== UPDATING POLICY STATUS ===', { policyId, newStatus, reviewerComment });
      
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
        .select('creator_id, status, parent_policy_id, archived_at, name, reviewer, policy_number')
        .eq('id', policyId)
        .single();

      if (fetchError) {
        console.error('Error fetching current policy:', fetchError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load policy details.",
        });
        return;
      }

      console.log('=== CURRENT POLICY DATA ===', currentPolicy);

      // Check permissions for status changes
      const canPublish = userRole === 'publish' || userRole === 'super-admin';
      const canEdit = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

      // Validate permissions based on status change
      if (newStatus === 'under-review' && !canEdit) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to submit policies for review.",
        });
        return;
      }

      if (newStatus === 'published' && !canPublish) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to publish policies.",
        });
        return;
      }

      // Relaxed maker/checker rule - only apply for non-super admins when publishing
      if (newStatus === 'published' && currentPolicy.creator_id === currentUser.id && !isSuperAdmin) {
        console.log('=== MAKER/CHECKER RULE VIOLATION FOR NON-SUPER-ADMIN ===');
        toast({
          variant: "destructive",
          title: "Publishing Not Allowed",
          description: "You cannot publish a policy you created. Another reviewer must publish it due to maker/checker controls.",
        });
        return;
      }

      let updateData: any = { 
        status: newStatus,
        reviewer_comment: reviewerComment || null,
        updated_at: new Date().toISOString()
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
        console.log('=== PUBLISHING POLICY ===', policyId);
        
        // Archive old versions with the same policy number first
        if (currentPolicy.policy_number) {
          console.log('=== ARCHIVING OLD VERSIONS ===', currentPolicy.policy_number);
          const { error: archiveError } = await supabase
            .from('Policies')
            .update({ 
              archived_at: new Date().toISOString(),
              status: 'archived'
            })
            .eq('policy_number', currentPolicy.policy_number)
            .neq('id', policyId)
            .is('archived_at', null);

          if (archiveError) {
            console.error('Error archiving old versions:', archiveError);
            // Don't fail the publish operation if archiving fails
          } else {
            console.log('=== OLD VERSIONS ARCHIVED SUCCESSFULLY ===');
          }
        }

        // For super admins publishing their own policy, set publisher_id to null to bypass constraint
        if (isSuperAdmin && currentPolicy.creator_id === currentUser.id) {
          console.log('=== SUPER ADMIN PUBLISHING OWN POLICY - BYPASSING CONSTRAINT ===');
          updateData.publisher_id = null;
        } else {
          // For regular publishing flow, set the publisher
          updateData.publisher_id = currentUser.id;
        }
        
        updateData.published_at = new Date().toISOString();

        // Strip colors from all content fields when publishing
        const { data: policyContent, error: contentError } = await supabase
          .from('Policies')
          .select('purpose, policy_text, procedure')
          .eq('id', policyId)
          .single();

        if (contentError) {
          console.error('Error fetching policy content:', contentError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch policy content for cleaning.",
          });
          return;
        }

        const cleanedFields = stripColorsFromPolicyFields(policyContent);
        updateData = {
          ...updateData,
          ...cleanedFields
        };
      }

      // Set reviewer when assigning for review
      if (newStatus === 'under-review' && !currentPolicy.reviewer) {
        updateData.reviewer = currentUser.email;
      }

      console.log('=== UPDATING POLICY WITH DATA ===', updateData);

      const { error: updateError } = await supabase
        .from('Policies')
        .update(updateData)
        .eq('id', policyId);

      if (updateError) {
        console.error('Error updating policy status:', updateError);
        
        // Handle specific database constraint violations
        if (updateError.message?.includes('check_creator_not_publisher')) {
          if (isSuperAdmin) {
            toast({
              variant: "destructive",
              title: "Database Constraint Error",
              description: "There's a database constraint preventing this action. Please contact system administrator to review database policies for super admin permissions.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Publishing Not Allowed",
              description: "Database constraint violation: Creator cannot be the publisher. Another reviewer must publish this policy.",
            });
          }
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to update policy status: ${updateError.message}`,
          });
        }
        return;
      }

      // Send notifications
      await notifyPolicyStatusChange({
        policyId,
        policyName: currentPolicy.name || 'Untitled Policy',
        oldStatus: currentPolicy.status,
        newStatus,
        creatorId: currentPolicy.creator_id,
        reviewerId: newStatus === 'under-review' ? currentUser.id : currentPolicy.reviewer ? 
          (await supabase.from('profiles').select('id').eq('email', currentPolicy.reviewer).single())?.data?.id : undefined,
        reviewerComment,
        publisherId: newStatus === 'published' ? currentUser.id : undefined,
      });

      // Send comment notification if reviewer comment is added
      if (reviewerComment && currentPolicy.creator_id && currentPolicy.creator_id !== currentUser.id) {
        await notifyPolicyComment(
          policyId,
          currentPolicy.name || 'Untitled Policy',
          currentPolicy.creator_id,
          reviewerComment
        );
      }

      let statusMessage = '';
      switch (newStatus) {
        case 'published':
          statusMessage = isSuperAdmin && currentPolicy.creator_id === currentUser.id
            ? "Policy published successfully with super admin override. All colors have been removed from the content and old versions archived."
            : "Policy published successfully. All colors have been removed from the content and old versions archived.";
          break;
        case 'draft':
          statusMessage = currentPolicy.archived_at 
            ? "Policy restored from archive to draft status."
            : "Policy returned to draft status for editing.";
          break;
        case 'under-review':
          statusMessage = "Policy submitted for review successfully.";
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

      console.log('=== POLICY STATUS UPDATED SUCCESSFULLY ===');

      // Refresh the policies list
      await fetchPolicies();
    } catch (error) {
      console.error('Error updating policy status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating policy status.",
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
