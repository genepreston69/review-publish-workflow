
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PolicyCardActions } from './PolicyCardActions';
import { stripHtml } from './policyUtils';
import { Policy } from './types';
import { Eye } from 'lucide-react';

interface PolicyCardGridViewProps {
  policy: Policy;
  compact: boolean;
  canPublish: boolean;
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

export function PolicyCardGridView({
  policy,
  compact,
  canPublish,
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
}: PolicyCardGridViewProps) {
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
    <Card className={`h-full transition-all duration-200 hover:shadow-md border-slate-200 ${compact ? 'p-2' : ''}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-slate-800 leading-tight mb-1`}>
              {stripHtml(policy.name) || 'Untitled Policy'}
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              {policy.policy_number}
            </p>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${getStatusColor(policy.status)} text-xs px-2 py-0.5 capitalize`}
              >
                {stripHtml(policy.status) || 'Unknown'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {showView && onView && (
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
            <PolicyCardActions
              policyId={policy.id}
              policyStatus={policy.status}
              canPublish={canPublishPolicy}
              onUpdateStatus={onUpdateStatus}
              onEdit={onEdit}
              onView={onView}
              onDelete={onDelete}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'pt-0 px-3 pb-3' : 'pt-0'}>
        <div className="space-y-3">
          <div>
            <p className={`text-slate-700 ${compact ? 'text-xs' : 'text-sm'} line-clamp-2`}>
              {stripHtml(policy.purpose)?.substring(0, 100) || 'No purpose specified'}...
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Created:</span>
              <span className="text-slate-700 font-medium">
                {new Date(policy.created_at).toLocaleDateString()}
              </span>
            </div>
            {policy.policy_type && (
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="text-slate-700 font-medium">{policy.policy_type}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
