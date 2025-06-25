
import { useState, useEffect } from 'react';
import { diffWords } from 'diff';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PolicyRevision, toPolicyRevisionType } from '../types';

export function useRevisionManager(policyId: string, fieldName: string) {
  const [revisions, setRevisions] = useState<PolicyRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, userRole } = useAuth();

  const canReview = userRole === 'publish' || userRole === 'super-admin';

  const loadRevisions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('policy_revisions')
        .select(`
          *,
          created_by_profile:profiles!policy_revisions_created_by_fkey(id, name, email),
          reviewed_by_profile:profiles!policy_revisions_reviewed_by_fkey(id, name, email)
        `)
        .eq('policy_id', policyId)
        .eq('field_name', fieldName)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading revisions:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load revisions.",
        });
        return;
      }

      // Convert to typed revisions
      const typedRevisions = (data || []).map(toPolicyRevisionType);
      setRevisions(typedRevisions);
    } catch (error) {
      console.error('Error loading revisions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load revisions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRevision = async (originalContent: string, currentContent: string) => {
    if (!currentUser || originalContent === currentContent) return;

    try {
      const diff = diffWords(originalContent, currentContent);
      let changeType: 'addition' | 'deletion' | 'modification' = 'modification';
      
      if (!originalContent || originalContent.trim() === '') {
        changeType = 'addition';
      } else if (!currentContent || currentContent.trim() === '') {
        changeType = 'deletion';
      }

      const { data: revisionNumber } = await supabase
        .rpc('get_next_revision_number', { p_policy_id: policyId });

      // Convert diff data to JSON-compatible format
      const diffData = diff.map(part => ({
        added: Boolean(part.added),
        removed: Boolean(part.removed),
        value: part.value
      }));

      const { error } = await supabase
        .from('policy_revisions')
        .insert({
          policy_id: policyId,
          revision_number: revisionNumber || 1,
          field_name: fieldName,
          original_content: originalContent,
          modified_content: currentContent,
          change_type: changeType,
          change_metadata: { diff_data: diffData },
          created_by: currentUser.id,
        });

      if (error) {
        console.error('Error creating revision:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create revision.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Revision created successfully.",
      });

      await loadRevisions();
    } catch (error) {
      console.error('Error creating revision:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create revision.",
      });
    }
  };

  const updateRevisionStatus = async (revisionId: string, status: 'accepted' | 'rejected', comment?: string) => {
    if (!canReview) return;

    try {
      const { error } = await supabase
        .from('policy_revisions')
        .update({
          status,
          reviewed_by: currentUser?.id,
          reviewed_at: new Date().toISOString(),
          review_comment: comment || null,
        })
        .eq('id', revisionId);

      if (error) {
        console.error('Error updating revision status:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update revision status.",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Revision ${status} successfully.`,
      });

      await loadRevisions();
    } catch (error) {
      console.error('Error updating revision status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update revision status.",
      });
    }
  };

  useEffect(() => {
    loadRevisions();
  }, [policyId, fieldName]);

  return {
    revisions,
    isLoading,
    canReview,
    loadRevisions,
    createRevision,
    updateRevisionStatus,
  };
}
