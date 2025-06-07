
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { FacilityPoliciesGrid } from './policy/FacilityPoliciesGrid';
import { useAllUserPolicies } from '@/hooks/useAllUserPolicies';

export function HRPolicies() {
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const { userRole } = useAuth();
  const { hrPolicies, isLoadingPolicies, refetchPolicies } = useAllUserPolicies();

  const canPublish = userRole === 'publish' || userRole === 'admin';
  const isAdmin = userRole === 'admin';
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

  console.log('=== ADMIN HR POLICIES COMPONENT ===');
  console.log('HR Policies count:', hrPolicies.length);
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
          <h2 className="text-2xl font-bold tracking-tight">HR Policies</h2>
          <p className="text-muted-foreground">
            View published human resources policies and procedures
          </p>
          {hrPolicies.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {hrPolicies.length} published HR {hrPolicies.length === 1 ? 'policy' : 'policies'}
            </p>
          )}
        </div>
      </div>

      {hrPolicies.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-4 text-lg font-medium">No published HR policies found</h3>
          <p className="text-gray-500">No HR policies have been published yet.</p>
        </div>
      ) : (
        <FacilityPoliciesGrid
          policies={hrPolicies}
          isEditor={isEditor}
          canPublish={canPublish}
          isSuperAdmin={isAdmin}
          onView={handleViewPolicy}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeletePolicy}
          onRefresh={refetchPolicies}
        />
      )}

      {viewingPolicyId && (
        <PolicyViewModal
          policyId={viewingPolicyId}
          onClose={handleCloseView}
          onUpdateStatus={handleUpdateStatus}
          onRefresh={refetchPolicies}
        />
      )}
    </div>
  );
}
