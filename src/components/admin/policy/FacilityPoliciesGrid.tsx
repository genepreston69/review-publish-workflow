
import { FacilityPolicyCard } from './FacilityPolicyCard';
import { Policy } from './types';

interface FacilityPoliciesGridProps {
  policies: Policy[];
  isEditor: boolean;
  canPublish: boolean;
  isSuperAdmin: boolean;
  onView: (policyId: string) => void;
  onUpdateStatus: (policyId: string, newStatus: string) => void;
  onDelete: (policyId: string) => void;
  onRefresh?: () => void;
}

export function FacilityPoliciesGrid({ 
  policies, 
  isEditor, 
  canPublish, 
  isSuperAdmin, 
  onView, 
  onUpdateStatus, 
  onDelete,
  onRefresh
}: FacilityPoliciesGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
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
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
