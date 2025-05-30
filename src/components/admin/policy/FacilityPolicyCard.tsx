
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PolicyCardActions } from './PolicyCardActions';
import { PolicyNumberDisplay } from './PolicyNumberDisplay';
import { stripHtml } from './policyUtils';

interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  policy_text: string | null;
  procedure: string | null;
  purpose: string | null;
  reviewer: string | null;
  status: string | null;
  created_at: string;
}

interface FacilityPolicyCardProps {
  policy: Policy;
  isEditor: boolean;
  canPublish: boolean;
  isSuperAdmin: boolean;
  onView: (policyId: string) => void;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onDelete: (policyId: string) => void;
  onRefresh?: () => void;
}

export function FacilityPolicyCard({ 
  policy, 
  isEditor, 
  canPublish, 
  isSuperAdmin, 
  onView, 
  onUpdateStatus, 
  onDelete,
  onRefresh
}: FacilityPolicyCardProps) {
  const getStatusColor = (status: string | null) => {
    const cleanStatus = stripHtml(status);
    switch (cleanStatus?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under-review':
      case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
              {stripHtml(policy.name) || 'Untitled Policy'}
            </h3>
            <PolicyNumberDisplay policyNumber={policy.policy_number} />
          </div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(policy.status)} shrink-0 capitalize`}
          >
            {stripHtml(policy.status) || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          {policy.purpose && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Purpose:</p>
              <p className="text-sm text-gray-800 line-clamp-2">{stripHtml(policy.purpose)}</p>
            </div>
          )}
          
          {policy.reviewer && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Reviewer:</p>
              <p className="text-sm text-gray-800">{stripHtml(policy.reviewer)}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Created:</p>
            <p className="text-sm text-gray-800">{formatDate(policy.created_at)}</p>
          </div>
        </div>

        <PolicyCardActions
          policyId={policy.id}
          policyStatus={policy.status}
          canPublish={canPublish}
          onUpdateStatus={onUpdateStatus}
          onView={onView}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      </CardContent>
    </Card>
  );
}
