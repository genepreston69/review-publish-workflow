
import { Button } from '@/components/ui/button';
import { RotateCcw, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
}

export function PolicyViewActions({ 
  policy, 
  onClose, 
  onEdit, 
  onUpdateStatus, 
  onReturnToDraft 
}: PolicyViewActionsProps) {
  const { userRole } = useAuth();
  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isEditor = userRole === 'edit';

  return (
    <div className="flex justify-between mt-6 pt-4 border-t">
      <div className="flex gap-2">
        {/* Return to Draft Button - Show prominently for publishers on under-review policies */}
        {canPublish && onUpdateStatus && (policy.status === 'under-review' || policy.status === 'under review') && (
          <Button 
            variant="outline" 
            onClick={onReturnToDraft}
            className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-orange-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Return to Draft
          </Button>
        )}

        {/* Update Policy Button - Show for published policies for users with edit/publish permissions */}
        {policy.status === 'published' && onUpdateStatus && (isEditor || canPublish) && (
          <Button 
            variant="outline" 
            onClick={onReturnToDraft}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Update Policy
          </Button>
        )}

        {/* Edit Button */}
        {onEdit && (
          (isEditor && policy.status === 'draft') ||
          (canPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review'))
        ) && (
          <Button variant="outline" onClick={() => onEdit(policy.id)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Policy
          </Button>
        )}
      </div>

      <Button onClick={onClose}>
        Close
      </Button>
    </div>
  );
}
