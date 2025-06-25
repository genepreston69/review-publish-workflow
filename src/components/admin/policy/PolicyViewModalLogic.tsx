
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePolicyDuplication } from '@/hooks/usePolicyDuplication';
import { useAuth } from '@/hooks/useAuth';
import { generatePolicyPrintTemplate } from './policyPrintUtils';
import { Policy } from './types';

interface PolicyViewModalLogicProps {
  policyId: string;
  onClose: () => void;
  onEdit?: (policyId: string) => void;
  onUpdateStatus?: (policyId: string, newStatus: string, comment?: string) => void;
  onRefresh?: () => void;
}

export function usePolicyViewModalLogic({
  policyId,
  onClose,
  onEdit,
  onUpdateStatus,
  onRefresh
}: PolicyViewModalLogicProps) {
  const { toast } = useToast();
  const { userRole, currentUser } = useAuth();
  const { archiveOldVersions } = usePolicyDuplication();
  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [viewingVersionId, setViewingVersionId] = useState<string>(policyId);

  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isSuperAdmin = userRole === 'super-admin';
  const isCreator = currentUser?.id === policy?.creator_id;
  const canApproveOrPublish = isSuperAdmin || (canPublish && !isCreator);

  const loadPolicy = async () => {
    try {
      setIsLoading(true);
      console.log('=== LOADING POLICY FOR VIEW ===', viewingVersionId);

      const { data, error } = await supabase
        .from('Policies')
        .select(`
          *,
          creator:creator_id(id, name, email),
          publisher:publisher_id(id, name, email)
        `)
        .eq('id', viewingVersionId)
        .single();

      if (error) {
        console.error('Error loading policy:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load policy for viewing.",
        });
        onClose();
        return;
      }

      console.log('=== POLICY LOADED FOR VIEW ===', data);
      setPolicy(data);
    } catch (error) {
      console.error('Error loading policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load policy for viewing.",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (viewingVersionId) {
      loadPolicy();
    }
  }, [viewingVersionId, toast, onClose]);

  const handlePrintPolicy = () => {
    if (!policy) return;

    try {
      const printHtml = generatePolicyPrintTemplate(
        policy.name || 'Untitled Policy',
        policy.policy_number || 'N/A',
        policy.policy_type || 'N/A',
        policy.policy_text || '',
        policy.reviewer || 'Unknown',
        policy.created_at,
        policy.status || 'Unknown'
      );

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printHtml);
        printWindow.document.close();
        
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };

        toast({
          title: "Success",
          description: "Policy print dialog opened.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to open print window. Please check your browser's popup settings.",
        });
      }
    } catch (error) {
      console.error('Error printing policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to print policy.",
      });
    }
  };

  const handleTopPublish = async () => {
    if (!policy || !onUpdateStatus) return;

    console.log('=== TOP PUBLISH BUTTON CLICKED ===', policy.id);
    try {
      const parentPolicyId = policy.parent_policy_id || policy.id;
      await archiveOldVersions(parentPolicyId, policy.id);
      
      await onUpdateStatus(policy.id, 'published');
      toast({
        title: "Success",
        description: "Policy published successfully. Previous versions have been archived.",
      });
      
      await loadPolicy();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error publishing policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish policy.",
      });
    }
  };

  const handleReturnToDraft = async () => {
    if (!policy || !onUpdateStatus) return;

    console.log('=== RETURNING POLICY TO DRAFT ===', policy.id);
    try {
      await onUpdateStatus(policy.id, 'draft');
      const message = policy.status === 'published' 
        ? 'Policy returned to draft status for editing'
        : 'Policy returned to draft status';
      
      toast({
        title: "Success",
        description: message,
      });
      
      await loadPolicy();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error returning policy to draft:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to return policy to draft status.",
      });
    }
  };

  const handlePublish = async () => {
    if (!policy || !onUpdateStatus) return;

    console.log('=== PUBLISHING POLICY WITH VERSIONING ===', policy.id);
    try {
      const parentPolicyId = policy.parent_policy_id || policy.id;
      await archiveOldVersions(parentPolicyId, policy.id);
      
      await onUpdateStatus(policy.id, 'published');
      toast({
        title: "Success",
        description: "Policy published successfully. Previous versions have been archived.",
      });
      
      await loadPolicy();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error publishing policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish policy.",
      });
    }
  };

  const handleUpdateStatusWithRefresh = async (policyId: string, newStatus: string, comment?: string) => {
    if (onUpdateStatus) {
      console.log('=== UPDATING STATUS WITH REFRESH ===', { policyId, newStatus, comment });
      await onUpdateStatus(policyId, newStatus, comment);
      
      await loadPolicy();
      
      if (onRefresh) {
        onRefresh();
      }
    }
  };

  const handleViewVersion = (versionId: string) => {
    setViewingVersionId(versionId);
  };

  const handleViewReplacement = (replacementPolicyId: string) => {
    setViewingVersionId(replacementPolicyId);
  };

  const handleArchivePolicy = async (policyId: string) => {
    try {
      console.log('=== ARCHIVING POLICY ===', policyId);
      
      const { error } = await supabase
        .from('Policies')
        .update({ 
          archived_at: new Date().toISOString(),
          status: 'archived'
        })
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
      
      if (onRefresh) {
        onRefresh();
      }
      onClose();
    } catch (error) {
      console.error('Error archiving policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  const showTopPublishButton = canApproveOrPublish && 
    (policy?.status === 'draft' || policy?.status === 'under-review' || policy?.status === 'under review');

  return {
    isLoading,
    policy,
    policyId,
    viewingVersionId,
    showTopPublishButton,
    handlePrintPolicy,
    handleTopPublish,
    handleReturnToDraft,
    handlePublish,
    handleUpdateStatusWithRefresh,
    handleViewVersion,
    handleViewReplacement,
    handleArchivePolicy,
    loadPolicy
  };
}
