
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Archive, Send } from 'lucide-react';
import { PolicyCardHeader } from './PolicyCardHeader';
import { PolicyCardContent } from './PolicyCardContent';
import { Policy } from './types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatDate';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PolicyCardProps {
  policy: Policy;
  canPublish: boolean;
  isEditing: boolean;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onEdit?: (policyId: string) => void;
  onView?: (policyId: string) => void;
  onDelete?: (policyId: string) => void;
  onArchive?: (policyId: string) => void;
}

export function PolicyCard({
  policy,
  canPublish,
  isEditing,
  onUpdateStatus,
  onEdit,
  onView,
  onDelete,
  onArchive,
}: PolicyCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(policy.id, newStatus);
    } catch (error) {
      console.error('Error updating policy status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update policy status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const canEdit = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';
  const canDelete = userRole === 'super-admin';
  const canArchive = userRole === 'super-admin';
  const isCreator = policy.creator_id === currentUser?.id;

  return (
    <Card className="h-full">
      <CardHeader>
        <PolicyCardHeader policy={policy} />
        <PolicyCardContent policy={policy} />
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Metadata */}
        <div className="text-xs text-gray-500 space-y-1">
          {policy.creator_id && (
            <div>Created by: {policy.creator_id}</div>
          )}
          {policy.publisher_id && (
            <div>Published by: {policy.publisher_id}</div>
          )}
          {policy.published_at && (
            <div>Published: {formatDate(policy.published_at)}</div>
          )}
          {policy.reviewer_comment && (
            <div className="text-red-600">
              Comment: {policy.reviewer_comment}
            </div>
          )}
        </div>

        {/* Actions - Grid layout with 3 buttons per row */}
        <div className="grid grid-cols-3 gap-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(policy.id)}
              className="w-full text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          )}

          {onEdit && canEdit && (policy.status === 'draft' || policy.status === 'awaiting-changes' || canPublish) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(policy.id)}
              className="w-full text-xs"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}

          {/* Submit for Review button - only for draft policies */}
          {policy.status === 'draft' && (canEdit || isCreator) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus('under-review')}
              disabled={isUpdating}
              className="w-full text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Send className="w-3 h-3 mr-1" />
              Submit for Review
            </Button>
          )}

          {canArchive && onArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onArchive(policy.id)}
              className="w-full text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Archive className="w-3 h-3 mr-1" />
              Archive
            </Button>
          )}

          {canDelete && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this policy? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(policy.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
