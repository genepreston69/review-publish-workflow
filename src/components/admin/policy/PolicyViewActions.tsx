
import { Button } from '@/components/ui/button';
import { RotateCcw, Edit, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePolicyDuplication } from '@/hooks/usePolicyDuplication';

interface Policy {
  id: string;
  status: string | null;
}

interface PolicyViewActionsProps {
  policy: Policy;
  onClose: () => void;
  onEdit?: (policyId: string) => void;
  onUpdateStatus?: (policyId: string, newStatus: string) => void;
  onReturnToDraft: () => void;
  onPublish?: () => void;
  onRefresh?: () => void;
}

export function PolicyViewActions({ 
  policy, 
  onClose, 
  onEdit, 
  onUpdateStatus, 
  onReturnToDraft,
  onPublish,
  onRefresh
}: PolicyViewActionsProps) {
  const { userRole } = useAuth();
  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isEditor = userRole === 'edit';
  const { duplicatePolicyForUpdate, isLoading: isDuplicating } = usePolicyDuplication();

  const handleUpdatePolicy = async () => {
    const newPolicyId = await duplicatePolicyForUpdate(policy.id);
    if (newPolicyId && onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="flex justify-between mt-6 pt-4 border-t">
      <div className="flex gap-2">
        {/* Return to Draft Button - Show prominently for publishers on under-review policies */}
        {canPublish && onUpdateStatus && (policy.status === 'under-review' || policy.status === 'under review') && (
          <Button 
            variant="outline" 
            onClick={onReturnToDraft}
            className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Return to Draft
          </Button>
        )}

        {/* Update Policy Button - Show for published policies for users with edit/publish permissions */}
        {policy.status === 'published' && (isEditor || canPublish) && (
          <Button 
            variant="outline" 
            onClick={handleUpdatePolicy}
            disabled={isDuplicating}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isDuplicating ? 'Creating Copy...' : 'Update Policy'}
          </Button>
        )}

        {/* Edit Button */}
        {onEdit && (
          (isEditor && policy.status === 'draft') ||
          (canPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review'))
        ) && (
          <Button 
            variant="outline" 
            onClick={() => onEdit(policy.id)}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Policy
          </Button>
        )}

        {/* Publish Button - Show for publishers/admins on draft or under-review policies */}
        {canPublish && onPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review') && (
          <Button 
            onClick={onPublish}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Publish Policy
          </Button>
        )}
      </div>

      <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
        Close
      </Button>
    </div>
  );
}
