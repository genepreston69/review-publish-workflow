
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PolicyRevision, toPolicyRevisionType } from './types';

export const useRevisions = (policyId: string) => {
  const [revisions, setRevisions] = useState<PolicyRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRevisions = async () => {
    try {
      setIsLoading(true);
      console.log('=== FETCHING REVISIONS ===', policyId);

      const { data, error } = await supabase
        .from('policy_revisions')
        .select(`
          *,
          created_by_profile:created_by(id, name, email),
          reviewed_by_profile:reviewed_by(id, name, email)
        `)
        .eq('policy_id', policyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching revisions:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load revisions.",
        });
        setRevisions([]);
        return;
      }

      console.log('=== REVISIONS FETCHED ===', data?.length || 0);
      // Convert to typed revisions
      const typedRevisions = (data || []).map(toPolicyRevisionType);
      setRevisions(typedRevisions);
    } catch (error) {
      console.error('Error fetching revisions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading revisions.",
      });
      setRevisions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createRevision = async (
    fieldName: string,
    originalContent: string,
    modifiedContent: string,
    createdBy: string
  ) => {
    try {
      console.log('=== CREATING REVISION ===', { fieldName, policyId });

      // Determine change type
      let changeType: 'addition' | 'deletion' | 'modification' = 'modification';
      if (!originalContent || originalContent.trim() === '') {
        changeType = 'addition';
      } else if (!modifiedContent || modifiedContent.trim() === '') {
        changeType = 'deletion';
      }

      // Get next revision number
      const { data: revisionNumber } = await supabase
        .rpc('get_next_revision_number', { p_policy_id: policyId });

      const { error } = await supabase
        .from('policy_revisions')
        .insert({
          policy_id: policyId,
          revision_number: revisionNumber,
          field_name: fieldName,
          original_content: originalContent,
          modified_content: modifiedContent,
          change_type: changeType,
          change_metadata: {},
          created_by: createdBy,
        });

      if (error) {
        console.error('Error creating revision:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create revision.",
        });
        return false;
      }

      console.log('=== REVISION CREATED SUCCESSFULLY ===');
      toast({
        title: "Success",
        description: "Revision created successfully.",
      });

      await fetchRevisions();
      return true;
    } catch (error) {
      console.error('Error creating revision:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while creating revision.",
      });
      return false;
    }
  };

  const updateRevisionStatus = async (
    revisionId: string,
    status: 'accepted' | 'rejected',
    reviewedBy: string,
    reviewComment?: string
  ) => {
    try {
      console.log('=== UPDATING REVISION STATUS ===', { revisionId, status });

      const { error } = await supabase
        .from('policy_revisions')
        .update({
          status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          review_comment: reviewComment || null,
        })
        .eq('id', revisionId);

      if (error) {
        console.error('Error updating revision status:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update revision status.",
        });
        return false;
      }

      console.log('=== REVISION STATUS UPDATED SUCCESSFULLY ===');
      toast({
        title: "Success",
        description: `Revision ${status} successfully.`,
      });

      await fetchRevisions();
      return true;
    } catch (error) {
      console.error('Error updating revision status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating revision status.",
      });
      return false;
    }
  };

  const getPendingRevisionsCount = () => {
    return revisions.filter(r => r.status === 'pending').length;
  };

  const hasUnresolvedChanges = () => {
    return getPendingRevisionsCount() > 0;
  };

  useEffect(() => {
    if (policyId) {
      fetchRevisions();
    }
  }, [policyId]);

  return {
    revisions,
    isLoading,
    fetchRevisions,
    createRevision,
    updateRevisionStatus,
    getPendingRevisionsCount,
    hasUnresolvedChanges,
  };
};
