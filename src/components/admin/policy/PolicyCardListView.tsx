
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PolicyCardActions } from './PolicyCardActions';
import { stripHtml } from './policyUtils';
import { Policy } from './types';
import { Eye, FileText } from 'lucide-react';

interface PolicyCardListViewProps {
  policy: Policy;
  showEdit?: boolean;
  showSubmit: boolean;
  showView?: boolean;
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
  showView,
  canPublishPolicy,
  canArchive,
  canDelete,
  onUpdateStatus,
  onEdit,
  onView,
  onDelete,
  onArchive,
}: PolicyCardListViewProps) {
  const getStatusColor = (status: string | null) => {
    const cleanStatus = stripHtml(status);
    switch (cleanStatus?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under-review':
      case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'awaiting-changes':
      case 'awaiting changes':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <FileText className="h-5 w-5 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-slate-800 truncate">
              {stripHtml(policy.name) || 'Untitled Policy'}
            </h3>
            <span className="text-sm text-slate-500">
              {policy.policy_number}
            </span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-1">
            {stripHtml(policy.purpose)?.substring(0, 100) || 'No purpose specified'}...
          </p>
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
            <span>{new Date(policy.created_at).toLocaleDateString()}</span>
            <Badge 
              variant="outline" 
              className={`${getStatusColor(policy.status)} text-xs px-2 py-0.5 capitalize`}
            >
              {stripHtml(policy.status) || 'Unknown'}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-4 flex-shrink-0">
        {/* Always show view button on the right */}
        {onView && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onView(policy.id)}
            title="View Policy"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        {/* Show other actions only if they exist */}
        {(showEdit || showSubmit || canPublishPolicy || canArchive || canDelete) && (
          <PolicyCardActions
            policyId={policy.id}
            policyStatus={policy.status}
            canPublish={canPublishPolicy}
            onUpdateStatus={onUpdateStatus}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}
