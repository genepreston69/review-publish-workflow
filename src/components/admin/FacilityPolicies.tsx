
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { FacilityPoliciesEmptyState } from './policy/FacilityPoliciesEmptyState';
import { FacilityPoliciesGrid } from './policy/FacilityPoliciesGrid';
import { useAllUserPolicies } from '@/hooks/useAllUserPolicies';

export function FacilityPolicies() {
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const { userRole } = useAuth();
  const { facilityPolicies, isLoadingPolicies, refetchPolicies } = useAllUserPolicies();

  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isSuperAdmin = userRole === 'super-admin';
  const isEditor = userRole === 'edit';

  const handleViewPolicy = (policyId: string) => {
    setViewingPolicyId(policyId);
  };

  const handleCloseView = () => {
    setViewingPolicyId(null);
  };

  const handleUpdateStatus = async (policyId: string, newStatus: string) => {
    // This would typically update the policy status in the database
    // For now, just refetch the policies
    await refetchPolicies();
  };

  const handleDeletePolicy = async (policyId: string) => {
    // This would typically delete the policy from the database
    // For now, just refetch the policies
    await refetchPolicies();
  };

  console.log('=== ADMIN FACILITY POLICIES COMPONENT ===');
  console.log('Facility Policies count:', facilityPolicies.length);
  console.log('Is loading:', isLoadingPolicies);

  if (isLoadingPolicies) {
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

      {facilityPolicies.length === 0 ? (
        <FacilityPoliciesEmptyState />
      ) : (
        <FacilityPoliciesGrid
          policies={facilityPolicies}
          isEditor={isEditor}
          canPublish={canPublish}
          isSuperAdmin={isSuperAdmin}
          onView={handleViewPolicy}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeletePolicy}
        />
      )}

      {viewingPolicyId && (
        <PolicyViewModal
          policyId={viewingPolicyId}
          onClose={handleCloseView}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
