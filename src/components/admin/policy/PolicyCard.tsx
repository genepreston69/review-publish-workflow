
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Archive, Send, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Policy } from './types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatDate';
import { stripHtml, getStatusColor } from './policyUtils';
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
  compact?: boolean;
  listView?: boolean;
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
  compact = false,
  listView = false,
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
  const isSuperAdmin = userRole === 'super-admin';
  const isCreator = policy.creator_id === currentUser?.id;

  const canPublishPolicy = (isSuperAdmin || canPublish) && 
    (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'awaiting-changes') &&
    (isSuperAdmin || !isCreator);

  const showEdit = onEdit && canEdit && (
    isSuperAdmin || 
    (policy.status === 'draft' || policy.status === 'awaiting-changes') ||
    canPublish
  );

  const showSubmit = policy.status === 'draft' && (isSuperAdmin || canEdit || isCreator);

  if (listView) {
    return (
      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-slate-800 truncate">{stripHtml(policy.name) || 'Untitled Policy'}</h3>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 shrink-0">
                {policy.policy_number}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 line-clamp-1">{stripHtml(policy.purpose)}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              {policy.creator_id && <span>By {policy.creator_id}</span>}
              <span>{formatDate(policy.created_at)}</span>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(policy.status)} text-xs px-2 py-0.5 capitalize`}
              >
                {stripHtml(policy.status) || 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-4">
          {onView && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onView(policy.id)}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {showEdit && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit!(policy.id)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showSubmit && (
                <DropdownMenuItem onClick={() => handleUpdateStatus('under-review')}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </DropdownMenuItem>
              )}
              {canPublishPolicy && (
                <DropdownMenuItem onClick={() => handleUpdateStatus('published')}>
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
                <DropdownMenuItem onClick={() => onDelete(policy.id)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-md border-slate-200 ${compact ? 'p-2' : ''}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-slate-800 leading-tight`}>
              {stripHtml(policy.name) || 'Untitled Policy'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {policy.policy_number}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(policy.status)} text-xs px-2 py-0.5 capitalize`}
              >
                {stripHtml(policy.status) || 'Unknown'}
              </Badge>
            </div>
          </div>
          
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
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'pt-0 px-3 pb-3' : 'pt-0'}>
        <div className="space-y-3">
          {policy.purpose && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Purpose:</p>
              <p className={`text-slate-700 ${compact ? 'text-xs' : 'text-sm'} line-clamp-2`}>
                {stripHtml(policy.purpose)}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-2 text-xs">
            {policy.creator_id && (
              <div className="flex justify-between">
                <span className="text-slate-500">Creator:</span>
                <span className="text-slate-700 font-medium truncate ml-2">{policy.creator_id}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Created:</span>
              <span className="text-slate-700 font-medium">{formatDate(policy.created_at)}</span>
            </div>
            {policy.reviewer_comment && (
              <div className="text-red-600 text-xs">
                Comment: {policy.reviewer_comment}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
