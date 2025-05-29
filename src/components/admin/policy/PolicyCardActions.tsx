
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trash2, Edit, Eye, RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PolicyCardActionsProps {
  policyId: string;
  policyStatus: string | null;
  canPublish: boolean;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onEdit?: (policyId: string) => void;
  onView?: (policyId: string) => void;
  onDelete?: (policyId: string) => void;
}

export function PolicyCardActions({ 
  policyId, 
  policyStatus, 
  canPublish, 
  onUpdateStatus, 
  onEdit, 
  onView, 
  onDelete 
}: PolicyCardActionsProps) {
  const { userRole } = useAuth();
  const isSuperAdmin = userRole === 'super-admin';
  const isEditor = userRole === 'edit';

  return (
    <CardFooter className="pt-3 border-t">
      <div className="w-full space-y-2">
        {/* Primary Actions Row - View and Edit buttons */}
        <div className="flex gap-2 justify-between">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(policyId)}
              className="flex-1 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          )}

          {onEdit && (
            (isEditor && policyStatus === 'draft') ||
            (canPublish && (policyStatus === 'draft' || policyStatus === 'under-review' || policyStatus === 'under review'))
          ) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(policyId)}
              className="flex-1 text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}
        </div>

        {/* Status Change Actions */}
        {/* Return to Draft Button - Show prominently for publishers on under-review policies */}
        {canPublish && (policyStatus === 'under-review' || policyStatus === 'under review') && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStatus(policyId, 'draft')}
            className="w-full text-xs bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Return to Draft
          </Button>
        )}

        {/* Update Policy Button - Show for published policies for users with edit/publish permissions */}
        {policyStatus === 'published' && (isEditor || canPublish) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStatus(policyId, 'draft')}
            className="w-full text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Update Policy
          </Button>
        )}

        {/* Publisher Actions - Publish/Reject buttons */}
        {canPublish && (policyStatus === 'draft' || policyStatus === 'under-review' || policyStatus === 'under review') && (
          <div className="flex gap-2 justify-between">
            <Button
              size="sm"
              onClick={() => onUpdateStatus(policyId, 'published')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(policyId, 'archived')}
              className="flex-1 bg-red-50 border-red-300 text-red-600 hover:bg-red-100 text-xs"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {/* Destructive Actions - Delete button */}
        {isSuperAdmin && onDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(policyId)}
            className="w-full text-xs bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete Policy
          </Button>
        )}
      </div>
    </CardFooter>
  );
}
