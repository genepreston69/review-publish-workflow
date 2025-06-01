
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { PolicyCard } from './PolicyCard';
import { Policy } from './types';

interface PolicyListProps {
  policies: Policy[];
  isLoading: boolean;
  isEditor: boolean;
  canPublish: boolean;
  editingPolicyId?: string;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onEdit?: (policyId: string) => void;
  onView?: (policyId: string) => void;
  onDelete?: (policyId: string) => void;
}

export function PolicyList({ 
  policies, 
  isLoading, 
  isEditor, 
  canPublish, 
  editingPolicyId,
  onUpdateStatus, 
  onEdit, 
  onView, 
  onDelete 
}: PolicyListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <FileText className="mx-auto h-8 w-8 text-gray-400" />
            <h4 className="mt-2 text-sm font-medium">
              {isEditor && "No draft policies"}
              {canPublish && !isEditor && "No policies to review"}
            </h4>
            <p className="text-xs text-gray-500">
              {isEditor && "Your draft policies will appear here"}
              {canPublish && !isEditor && "Policies awaiting review will appear here"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {policies.map((policy) => (
        <PolicyCard
          key={policy.id}
          policy={policy}
          canPublish={canPublish}
          isEditing={editingPolicyId === policy.id}
          onUpdateStatus={onUpdateStatus}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
