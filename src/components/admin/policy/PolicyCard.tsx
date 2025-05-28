
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, CheckCircle, XCircle, Trash2, Edit, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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

interface PolicyCardProps {
  policy: Policy;
  canPublish: boolean;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onEdit?: (policyId: string) => void;
  onView?: (policyId: string) => void;
  onDelete?: (policyId: string) => void;
}

// Function to strip HTML tags from text
const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const getStatusColor = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'under-review':
    case 'under review':
      return 'bg-blue-100 text-blue-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function PolicyCard({ policy, canPublish, onUpdateStatus, onEdit, onView, onDelete }: PolicyCardProps) {
  const { userRole } = useAuth();
  const isSuperAdmin = userRole === 'super-admin';
  const isEditor = userRole === 'edit';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">
              {policy.name || 'Untitled Policy'}
            </CardTitle>
            {policy.policy_number && (
              <CardDescription className="font-mono text-xs">
                {policy.policy_number}
              </CardDescription>
            )}
          </div>
          {policy.status && (
            <Badge 
              variant="secondary" 
              className={getStatusColor(policy.status)}
            >
              {policy.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {policy.purpose && (
            <div>
              <h4 className="font-medium text-xs text-gray-700">Purpose</h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {stripHtml(policy.purpose)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            {policy.reviewer && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate max-w-20">{stripHtml(policy.reviewer)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(policy.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t space-y-2">
            {/* View Button - Show for all users */}
            {onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(policy.id)}
                className="w-full text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <Eye className="w-3 h-3 mr-1" />
                View Policy
              </Button>
            )}

            {/* Edit Button - Show for editors on their drafts, and publishers on review policies */}
            {onEdit && (
              (isEditor && policy.status === 'draft') ||
              (canPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review'))
            ) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(policy.id)}
                className="w-full text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit Policy
              </Button>
            )}

            {/* Publisher Actions */}
            {canPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review') && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(policy.id, 'published')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(policy.id, 'archived')}
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-xs"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Reject
                </Button>
              </div>
            )}

            {/* Super Admin Delete Action */}
            {isSuperAdmin && onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(policy.id)}
                className="w-full text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete Policy
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
