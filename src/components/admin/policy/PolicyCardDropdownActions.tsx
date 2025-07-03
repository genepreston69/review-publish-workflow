
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle, Archive, Trash2, Eye, Edit, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { Policy } from './types';

interface PolicyCardDropdownActionsProps {
  policy: Policy;
  canPublish: boolean;
  showEdit: boolean;
  showSubmit: boolean;
  canPublishPolicy: boolean;
  canArchive: boolean;
  canDelete: boolean;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onEdit?: (policyId: string) => void;
  onView?: (policyId: string) => void;
  onDelete?: (policyId: string) => void;
  onArchive?: (policyId: string) => void;
}

export function PolicyCardDropdownActions({
  policy,
  canPublish,
  showEdit,
  showSubmit,
  canPublishPolicy,
  canArchive,
  canDelete,
  onUpdateStatus,
  onEdit,
  onView,
  onDelete,
  onArchive,
}: PolicyCardDropdownActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { userRole } = useUserRole();

  const isSuperAdmin = userRole === 'super-admin';

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={() => onView(policy.id)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        {showEdit && (
          <DropdownMenuItem onClick={() => onEdit!(policy.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {showSubmit && (
          <DropdownMenuItem onClick={() => handleUpdateStatus('under-review')} disabled={isUpdating}>
            <Send className="mr-2 h-4 w-4" />
            Submit
          </DropdownMenuItem>
        )}
        {canPublishPolicy && (
          <DropdownMenuItem onClick={() => handleUpdateStatus('published')} disabled={isUpdating}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Publish
          </DropdownMenuItem>
        )}
        {canArchive && onArchive && (
          <DropdownMenuItem onClick={() => onArchive(policy.id)}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
        )}
        {canDelete && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
