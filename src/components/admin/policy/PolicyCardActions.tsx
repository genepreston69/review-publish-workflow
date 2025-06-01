
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

  // Determine which buttons to show in each row
  const showEditButton = onEdit && (
    isSuperAdmin ||
    (isEditor && policyStatus === 'draft') ||
    (canPublish && (policyStatus === 'draft' || policyStatus === 'under-review' || policyStatus === 'under review'))
  );

  const showSubmitButton = policyStatus === 'draft' && (isSuperAdmin || isEditor || canPublish);
  const showUpdateButton = policyStatus === 'published' && (isSuperAdmin || isEditor || canPublish);

  const showPublishButton = (isSuperAdmin || canPublish) && (policyStatus === 'draft' || policyStatus === 'under-review' || policyStatus === 'under review');
  const showArchiveButton = (isSuperAdmin || canPublish) && (policyStatus === 'draft' || policyStatus === 'under-review' || policyStatus === 'under review');
  const showDeleteButton = isSuperAdmin && onDelete;

  return (
    <CardFooter className="pt-6">
      <div className="w-full space-y-3">
        {/* First row - View, Edit, Submit/Update */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {/* View button - always shown */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView?.(policyId)}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>

          {/* Edit button or placeholder */}
          {showEditButton ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit!(policyId)}
              className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          ) : (
            <div></div>
          )}

          {/* Submit/Update button or placeholder */}
          {showSubmitButton ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(policyId, 'under-review')}
              className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Submit
            </Button>
          ) : showUpdateButton ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleUpdatePolicy}
              disabled={isDuplicating}
              className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              {isDuplicating ? 'Creating...' : 'Update'}
            </Button>
          ) : (
            <div></div>
          )}
        </div>

        {/* Second row - Publish, Archive, Delete */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {/* Publish button or placeholder */}
          {showPublishButton ? (
            <Button
              size="sm"
              onClick={handlePublish}
              className="text-xs bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Publish
            </Button>
          ) : (
            <div></div>
          )}

          {/* Archive button or placeholder */}
          {showArchiveButton ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(policyId, 'archived')}
              className="text-xs bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Archive
            </Button>
          ) : (
            <div></div>
          )}

          {/* Delete button or placeholder */}
          {showDeleteButton ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete!(policyId)}
              className="text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </CardFooter>
  );
}
