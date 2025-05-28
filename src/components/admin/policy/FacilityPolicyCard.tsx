
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Trash2, Eye, RotateCcw } from 'lucide-react';

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
}

// Function to strip HTML tags from text
const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const getStatusColor = (status: string | null) => {
  switch (status?.toLowerCase()) {
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

export function FacilityPolicyCard({ 
  policy, 
  isEditor, 
  canPublish, 
  isSuperAdmin, 
  onView, 
  onUpdateStatus, 
  onDelete 
}: FacilityPolicyCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {policy.name || 'Untitled Policy'}
            </CardTitle>
            {policy.policy_number && (
              <CardDescription className="font-mono text-sm">
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
      
      <CardContent className="flex flex-col flex-grow">
        {/* Main content area that flexes to fill space */}
        <div className="flex-grow space-y-3">
          {policy.purpose && (
            <div>
              <h4 className="font-medium text-sm text-gray-700">Purpose</h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {stripHtml(policy.purpose)}
              </p>
            </div>
          )}
          
          {policy.procedure && (
            <div>
              <h4 className="font-medium text-sm text-gray-700">Procedure</h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {stripHtml(policy.procedure)}
              </p>
            </div>
          )}
        </div>

        {/* User/date row - consistently positioned at bottom of content area */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 mt-4">
          {policy.reviewer && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{stripHtml(policy.reviewer)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(policy.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action buttons - anchored to bottom with border separator */}
        <div className="pt-3 border-t space-y-2 mt-3">
          {/* View Button for all published policies */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(policy.id)}
            className="w-full text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Eye className="w-3 h-3 mr-1" />
            View Policy
          </Button>

          {/* Update Policy Button - Show for users with edit/publish permissions */}
          {(isEditor || canPublish) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(policy.id, 'draft')}
              className="w-full text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Update Policy
            </Button>
          )}

          {/* Super Admin Delete Action for published policies */}
          {isSuperAdmin && (
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
      </CardContent>
    </Card>
  );
}
