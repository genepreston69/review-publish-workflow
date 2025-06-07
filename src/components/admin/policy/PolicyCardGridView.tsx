
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Policy } from './types';
import { formatDate } from '@/utils/formatDate';
import { stripHtml, getStatusColor } from './policyUtils';
import { PolicyCardDropdownActions } from './PolicyCardDropdownActions';

interface PolicyCardGridViewProps {
  policy: Policy;
  compact: boolean;
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

export function PolicyCardGridView({
  policy,
  compact,
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
}: PolicyCardGridViewProps) {
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
          
          <PolicyCardDropdownActions
            policy={policy}
            canPublish={canPublish}
            showEdit={showEdit}
            showSubmit={showSubmit}
            canPublishPolicy={canPublishPolicy}
            canArchive={canArchive}
            canDelete={canDelete}
            onUpdateStatus={onUpdateStatus}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
            onArchive={onArchive}
          />
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
            {(policy as any).creator?.name && (
              <div className="flex justify-between">
                <span className="text-slate-500">Creator:</span>
                <span className="text-slate-700 font-medium truncate ml-2">{(policy as any).creator.name}</span>
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
