import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Archive, Trash2, CheckCircle, RotateCcw, XCircle } from 'lucide-react';
import { Policy } from './types';
import { useAuth } from '@/hooks/useAuth';

interface PolicyCardActionsProps {
  policy: Policy;
  isEditor: boolean;
  canPublish: boolean;
  isAdmin: boolean;
  onView: (policyId: string) => void;
  onEdit?: (policyId: string) => void;
  onUpdateStatus?: (policyId: string, newStatus: string) => void;
  onDelete?: (policyId: string) => void;
  onArchive?: (policyId: string) => void;
}

export function PolicyCardActions({ 
  policy, 
  isEditor, 
  canPublish, 
  isAdmin,
  onView, 
  onEdit, 
  onUpdateStatus, 
  onDelete, 
  onArchive 
}: PolicyCardActionsProps) {
  const { currentUser, userRole } = useAuth();

  const canEdit = isAdmin || (isEditor && policy.creator_id === currentUser?.id);
  const canDelete = isAdmin;
  const canArchive = isAdmin;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(policy.id)}>
          <Eye className="w-4 h-4 mr-2" />
          View
        </DropdownMenuItem>
        {canEdit && onEdit && (
          <DropdownMenuItem onClick={() => onEdit(policy.id)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        {canPublish && onUpdateStatus && (
          <DropdownMenuItem onClick={() => onUpdateStatus(policy.id, 'under-review')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Submit for Review
          </DropdownMenuItem>
        )}
        {policy.status === 'under-review' && onUpdateStatus && (
          <DropdownMenuItem onClick={() => onUpdateStatus(policy.id, 'draft')}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Return to Draft
          </DropdownMenuItem>
        )}
        {canDelete && onDelete && (
          <DropdownMenuItem onClick={() => onDelete(policy.id)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
        {canArchive && onArchive && (
          <DropdownMenuItem onClick={() => onArchive(policy.id)}>
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </DropdownMenuItem>
        )}
        {policy.status === 'archived' && onUpdateStatus && (
          <DropdownMenuItem onClick={() => onUpdateStatus(policy.id, 'draft')}>
            <XCircle className="w-4 h-4 mr-2" />
            Restore
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
