import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Archive, Trash2, RotateCcw, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Policy } from './types';
import { useAuth } from '@/hooks/useAuth';

interface PolicyCardProps {
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

export function PolicyCard({ 
  policy, 
  isEditor, 
  canPublish, 
  isAdmin,
  onView, 
  onEdit, 
  onUpdateStatus, 
  onDelete, 
  onArchive 
}: PolicyCardProps) {
  const { currentUser, userRole } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'under-review':
      case 'under review':
        return 'bg-blue-100 text-blue-700';
      case 'awaiting-changes':
      case 'awaiting changes':
        return 'bg-orange-100 text-orange-700';
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return Clock;
      case 'under-review':
      case 'under review':
        return RotateCcw;
      case 'awaiting-changes':
      case 'awaiting changes':
        return XCircle;
      case 'published':
        return CheckCircle;
      case 'archived':
        return Archive;
      default:
        return Eye;
    }
  };

  const canEdit = isAdmin || (isEditor && policy.creator_id === currentUser?.id);
  const canDelete = isAdmin;
  const canArchive = isAdmin;

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold">{policy.name}</CardTitle>
            <p className="text-sm text-gray-500">
              Policy Number: {policy.policy_number || 'N/A'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(policy.status || 'draft')}>
                {policy.status}
              </Badge>
              <span className="text-sm text-gray-500">
                Created: {new Date(policy.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(policy.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">
          {policy.purpose?.substring(0, 100)}...
        </p>
      </CardContent>
    </Card>
  );
}
