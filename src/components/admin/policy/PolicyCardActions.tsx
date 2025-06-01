
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trash2, Edit, Eye, RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePolicyDuplication } from '@/hooks/usePolicyDuplication';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PolicyCardActionsProps {
  policyId: string;
  policyStatus: string | null;
  canPublish: boolean;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onEdit?: (policyId: string) => void;
  onView?: (policyId: string) => void;
  onDelete?: (policyId: string) => void;
  onRefresh?: () => void;
}

export function PolicyCardActions({ 
  policyId, 
  policyStatus, 
  canPublish, 
  onUpdateStatus, 
  onEdit, 
  onView, 
  onDelete,
  onRefresh
}: PolicyCardActionsProps) {
  const { userRole } = useAuth();
  const isSuperAdmin = userRole === 'super-admin';
  const isEditor = userRole === 'edit';
  const { duplicatePolicyForUpdate, isLoading: isDuplicating } = usePolicyDuplication();
  const { toast } = useToast();

  const handleUpdatePolicy = async () => {
    const newPolicyId = await duplicatePolicyForUpdate(policyId);
    if (newPolicyId && onRefresh) {
      onRefresh();
    }
  };

  const handlePublish = async () => {
    try {
      console.log('=== PUBLISHING POLICY WITH ARCHIVING ===', policyId);

      // Get the policy being published to find its policy number
      const { data: currentPolicy } = await supabase
        .from('Policies')
        .select('policy_number')
        .eq('id', policyId)
        .single();

      if (currentPolicy && currentPolicy.policy_number) {
        console.log('=== ARCHIVING POLICIES WITH SAME POLICY NUMBER ===', currentPolicy.policy_number);
        
        // Archive all other policies with the same policy number
        const { error: archiveError } = await supabase
          .from('Policies')
          .update({ archived_at: new Date().toISOString() })
          .eq('policy_number', currentPolicy.policy_number)
          .neq('id', policyId)
          .is('archived_at', null);

        if (archiveError) {
          console.error('Error archiving old versions:', archiveError);
        }
      }

      // Now publish the current policy
      await onUpdateStatus(policyId, 'published');
    } catch (error) {
      console.error('Error in publish process:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish policy.",
      });
    }
  };

  // First row buttons - primary actions
  const firstRowButtons = [];
  
  // View button - always first
  if (onView) {
    firstRowButtons.push(
      <Button
        key="view"
        size="sm"
        variant="outline"
        onClick={() => onView(policyId)}
        className="text-xs flex-1"
      >
        <Eye className="w-3 h-3 mr-1" />
        View
      </Button>
    );
  }

  // Edit button
  if (onEdit && (
    isSuperAdmin ||
    (isEditor && policyStatus === 'draft') ||
    (canPublish && (policyStatus === 'draft' || policyStatus === 'under-review' || policyStatus === 'under review'))
  )) {
    firstRowButtons.push(
      <Button
        key="edit"
        size="sm"
        variant="outline"
        onClick={() => onEdit(policyId)}
        className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50 flex-1"
      >
        <Edit className="w-3 h-3 mr-1" />
        Edit
      </Button>
    );
  }

  // Update Policy button for published policies
  if (policyStatus === 'published' && (isSuperAdmin || isEditor || canPublish)) {
    firstRowButtons.push(
      <Button
        key="update"
        size="sm"
        variant="outline"
        onClick={handleUpdatePolicy}
        disabled={isDuplicating}
        className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50 flex-1"
      >
        <RotateCcw className="w-3 h-3 mr-1" />
        {isDuplicating ? 'Creating...' : 'Update'}
      </Button>
    );
  }

  // Second row buttons - status change actions
  const secondRowButtons = [];

  // Return to Draft button for under-review policies
  if ((isSuperAdmin || canPublish) && (policyStatus === 'under-review' || policyStatus === 'under review')) {
    secondRowButtons.push(
      <Button
        key="draft"
        size="sm"
        variant="outline"
        onClick={() => onUpdateStatus(policyId, 'draft')}
        className="text-xs bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100 flex-1"
      >
        <RotateCcw className="w-3 h-3 mr-1" />
        Return to Draft
      </Button>
    );
  }

  // Publish button
  if ((isSuperAdmin || canPublish) && (policyStatus === 'draft' || policyStatus === 'under-review' || policyStatus === 'under review')) {
    secondRowButtons.push(
      <Button
        key="publish"
        size="sm"
        onClick={handlePublish}
        className="text-xs bg-green-600 hover:bg-green-700 text-white flex-1"
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        Publish
      </Button>
    );
  }

  // Reject button
  if ((isSuperAdmin || canPublish) && (policyStatus === 'draft' || policyStatus === 'under-review' || policyStatus === 'under review')) {
    secondRowButtons.push(
      <Button
        key="reject"
        size="sm"
        variant="outline"
        onClick={() => onUpdateStatus(policyId, 'archived')}
        className="text-xs bg-red-50 border-red-300 text-red-600 hover:bg-red-100 flex-1"
      >
        <XCircle className="w-3 h-3 mr-1" />
        Reject
      </Button>
    );
  }

  // Delete button - only for super admin
  if (isSuperAdmin && onDelete) {
    secondRowButtons.push(
      <Button
        key="delete"
        size="sm"
        variant="destructive"
        onClick={() => onDelete(policyId)}
        className="text-xs bg-red-600 hover:bg-red-700 text-white flex-1"
      >
        <Trash2 className="w-3 h-3 mr-1" />
        Delete
      </Button>
    );
  }

  return (
    <CardFooter className="pt-3 border-t flex-col space-y-2">
      {/* First row - Primary actions */}
      {firstRowButtons.length > 0 && (
        <div className="w-full flex gap-2">
          {firstRowButtons}
        </div>
      )}

      {/* Second row - Status change actions */}
      {secondRowButtons.length > 0 && (
        <div className="w-full flex gap-2">
          {secondRowButtons}
        </div>
      )}
    </CardFooter>
  );
}
