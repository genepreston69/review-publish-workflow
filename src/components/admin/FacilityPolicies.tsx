
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { FacilityPoliciesEmptyState } from './policy/FacilityPoliciesEmptyState';
import { FacilityPoliciesGrid } from './policy/FacilityPoliciesGrid';
import { useFacilityPolicies } from './policy/useFacilityPolicies';

export function FacilityPolicies() {
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const { userRole } = useAuth();
  const { policies, isLoading, updatePolicyStatus, deletePolicy } = useFacilityPolicies();

  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isSuperAdmin = userRole === 'super-admin';
  const isEditor = userRole === 'edit';

  const handleViewPolicy = (policyId: string) => {
    setViewingPolicyId(policyId);
  };

  const handleCloseView = () => {
    setViewingPolicyId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Facility Policies</h2>
          <p className="text-muted-foreground">
            View published facility policies and procedures
          </p>
        </div>
      </div>

      {policies.length === 0 ? (
        <FacilityPoliciesEmptyState />
      ) : (
        <FacilityPoliciesGrid
          policies={policies}
          isEditor={isEditor}
          canPublish={canPublish}
          isSuperAdmin={isSuperAdmin}
          onView={handleViewPolicy}
          onUpdateStatus={updatePolicyStatus}
          onDelete={deletePolicy}
        />
      )}

      {viewingPolicyId && (
        <PolicyViewModal
          policyId={viewingPolicyId}
          onClose={handleCloseView}
          onUpdateStatus={updatePolicyStatus}
        />
      )}
    </div>
  );
}
