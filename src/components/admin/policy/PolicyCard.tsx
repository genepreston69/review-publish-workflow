
import { Card } from '@/components/ui/card';
import { PolicyCardHeader } from './PolicyCardHeader';
import { PolicyCardContent } from './PolicyCardContent';
import { PolicyCardActions } from './PolicyCardActions';

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

export function PolicyCard({ policy, canPublish, onUpdateStatus, onEdit, onView, onDelete }: PolicyCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <PolicyCardHeader policy={policy} />
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
