
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, MoreHorizontal, FileText, Send, CheckCircle, Archive, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Policy } from './types';
import { formatDate } from '@/utils/formatDate';
import { stripHtml, getStatusColor } from './policyUtils';

interface PolicyCardListViewProps {
  policy: Policy;
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

export function PolicyCardListView({
  policy,
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
}: PolicyCardListViewProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <FileText className="h-5 w-5 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-slate-800 truncate">{stripHtml(policy.name) || 'Untitled Policy'}</h3>
            <Badge variant="secondary" className="text-xs px-2 py-0.5 shrink-0">
              {policy.policy_number}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 line-clamp-1">{stripHtml(policy.purpose)}</p>
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
            {(policy as any).creator?.name && <span>By {(policy as any).creator.name}</span>}
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
              <DropdownMenuItem onClick={() => onUpdateStatus(policy.id, 'under-review')}>
                <Send className="mr-2 h-4 w-4" />
                Submit
              </DropdownMenuItem>
            )}
            {canPublishPolicy && (
              <DropdownMenuItem onClick={() => onUpdateStatus(policy.id, 'published')}>
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
