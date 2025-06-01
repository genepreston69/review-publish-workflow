
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

  return (
    <CardFooter className="pt-3 border-t">
      <div className="w-full space-y-2">
        {/* First row - Primary actions */}
        <div className="flex gap-2 justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView?.(policyId)}
            className="text-xs flex-1"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>

          {/* Edit button - Super admins can edit any policy, others follow existing rules */}
          {onEdit && (
            isSuperAdmin ||
            (isEditor && policyStatus === 'draft') ||
            (canPublish && (policyStatus === 'draft' || policyStatus === 'under-review' || policyStatus === 'under review'))
          ) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(policyId)}
              className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50 flex-1"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}

          {/* Submit button for draft policies */}
          {policyStatus === 'draft' && (isSuperAdmin || isEditor || canPublish) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(policyId, 'under-review')}
              className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50 flex-1"
            >
              Submit
            </Button>
          )}

          {/* Update Policy button for published policies */}
          {policyStatus === 'published' && (isSuperAdmin || isEditor || canPublish) && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleUpdatePolicy}
              disabled={isDuplicating}
              className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50 flex-1"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              {isDuplicating ? 'Creating...' : 'Update'}
            </Button>
          )}
        </div>

        {/* Second row - Status change actions */}
        <div className="flex gap-2 justify-between">
          {/* Publish button with archiving - Super admins can publish any policy */}
          {(isSuperAdmin || canPublish) && (policyStatus === 'draft' || policyStatus === 'under-review' || policyStatus === 'under review') && (
            <Button
              size="sm"
              onClick={handlePublish}
              className="text-xs bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Publish
            </Button>
          )}

          {/* Return to Draft button for under-review policies */}
          {(isSuperAdmin || canPublish) && (policyStatus === 'under-review' || policyStatus === 'under review') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(policyId, 'draft')}
              className="text-xs bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100 flex-1"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Return to Draft
            </Button>
          )}

          {/* Archive/Reject button */}
          {(isSuperAdmin || canPublish) && (policyStatus === 'draft' || policyStatus === 'under-review' || policyStatus === 'under review') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(policyId, 'archived')}
              className="text-xs bg-red-50 border-red-300 text-red-600 hover:bg-red-100 flex-1"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Archive
            </Button>
          )}

          {/* Delete button */}
          {isSuperAdmin && onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(policyId)}
              className="text-xs bg-red-600 hover:bg-red-700 text-white flex-1"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </CardFooter>
  );
}
