import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Policy } from './types';

export const usePolicies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const { toast } = useToast();
  const { userRole, currentUser } = useAuth();

  const isSuperAdmin = userRole === 'admin';

  const fetchPolicies = async () => {
    try {
      setIsLoadingPolicies(true);
      
      let query = supabase.from('Policies').select('*');
      
      // Super admins can see all policies, others see based on their role and involvement
      if (userRole === 'admin') {
        // Admin can see all policies
      } else if (userRole === 'publish') {
        // Publishers can see all policies for review, plus their own drafts
        query = query.or(`status.neq.archived,creator_id.eq.${currentUser?.id}`);
      } else if (userRole === 'edit') {
        // Editors can see their own policies and published ones
        query = query.or(`creator_id.eq.${currentUser?.id},status.eq.published`);
      } else {
        // Read-only can only see published
        query = query.eq('status', 'published');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching policies:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load policies.",
        });
        return;
      }

      setPolicies(data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
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

      // Check maker/checker rule BEFORE attempting database update
      if (newStatus === 'published' && currentPolicy.creator_id === currentUser.id && !isSuperAdmin) {
        console.log('=== MAKER/CHECKER RULE VIOLATION ===');
        toast({
          variant: "destructive",
          title: "Publishing Not Allowed",
          description: "You cannot publish a policy you created. Another reviewer must publish it due to maker/checker controls.",
        });
        return;
      }

      // Check permissions for status changes (super admins bypass these checks)
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
      
      // Set publisher_id when publishing - ONLY if not violating maker/checker rule
      if (newStatus === 'published') {
        console.log('=== PUBLISHING POLICY ===', policyId);
        
        // Double-check maker/checker rule (safety check)
        if (currentPolicy.creator_id === currentUser.id && !isSuperAdmin) {
          console.error('=== ATTEMPTED MAKER/CHECKER VIOLATION ===');
          toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot publish: You are the creator of this policy. Another reviewer must publish it.",
          });
          return;
        }
        
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

        // Get publisher profile
        const { data: publisherProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching publisher profile:', profileError);
          toast({
            variant: "destructive",
            title: "Error", 
            description: "Could not fetch publisher profile.",
          });
          return;
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
          toast({
            variant: "destructive",
            title: "Publishing Not Allowed",
            description: "Database constraint violation: Creator cannot be the publisher. Another reviewer must publish this policy.",
          });
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
    if (currentUser && userRole) {
      fetchPolicies();
    }
  }, [currentUser, userRole]);

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
