
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PolicyCardHeader } from './PolicyCardHeader';
import { PolicyCardContent } from './PolicyCardContent';
import { PolicyCardActions } from './PolicyCardActions';
import { cn } from '@/lib/utils';
import { Policy } from './types';

interface PolicyCardProps {
  policy: Policy;
  canPublish: boolean;
  isEditing?: boolean;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onEdit?: (policyId: string) => void;
  onView?: (policyId: string) => void;
  onDelete?: (policyId: string) => void;
}

export function PolicyCard({ 
  policy, 
  canPublish, 
  isEditing = false,
  onUpdateStatus, 
  onEdit, 
  onView, 
  onDelete 
}: PolicyCardProps) {
  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow flex flex-col",
      isEditing && "ring-2 ring-orange-200 border-orange-300"
    )}>
      <PolicyCardHeader policy={policy}>
        {isEditing && (
          <Badge variant="editing" className="ml-2">
            Editing
          </Badge>
        )}
      </PolicyCardHeader>
      <PolicyCardContent policy={policy} />
      <PolicyCardActions
        policyId={policy.id}
        policyStatus={policy.status}
        canPublish={canPublish}
        onUpdateStatus={onUpdateStatus}
        onEdit={onEdit}
        onView={onView}
        onDelete={onDelete}
      />
    </Card>
  );
}
