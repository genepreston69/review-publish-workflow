
import { FacilityPolicyCard } from './FacilityPolicyCard';

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

interface FacilityPoliciesGridProps {
  policies: Policy[];
  isEditor: boolean;
  canPublish: boolean;
  isSuperAdmin: boolean;
  onView: (policyId: string) => void;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onDelete: (policyId: string) => void;
}

export function FacilityPoliciesGrid({ 
  policies, 
  isEditor, 
  canPublish, 
  isSuperAdmin, 
  onView, 
  onUpdateStatus, 
  onDelete 
}: FacilityPoliciesGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {policies.map((policy) => (
        <FacilityPolicyCard
          key={policy.id}
          policy={policy}
          isEditor={isEditor}
          canPublish={canPublish}
          isSuperAdmin={isSuperAdmin}
          onView={onView}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
