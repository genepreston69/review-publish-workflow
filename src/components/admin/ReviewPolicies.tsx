
import { useState } from 'react';
import { useServerAuth } from '@/hooks/useServerAuth';
import { PolicyList } from './policy/PolicyList';
import { PolicyEditForm } from './policy/PolicyEditForm';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { usePolicies } from './policy/usePolicies';
import { Policy } from './policy/types';
import { ReviewPoliciesHeader } from './review/ReviewPoliciesHeader';
import { ReviewPoliciesEmptyState } from './review/ReviewPoliciesEmptyState';
import { ReviewPoliciesAccessDenied } from './review/ReviewPoliciesAccessDenied';

export function ReviewPolicies() {
  const { currentUser, userRole } = useServerAuth();
  const { policies, isLoadingPolicies, updatePolicyStatus, deletePolicy, archivePolicy, isSuperAdmin, fetchPolicies } = usePolicies();
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // All possible status variations that need review
  const reviewStatuses = ['draft', 'under-review', 'under review', 'awaiting-changes', 'awaiting changes'];

  // Filter to show policies that need review with proper access control
  const reviewPolicies = policies.filter(policy => {
    // Check if policy needs review (case-insensitive and flexible matching)
    const needsReview = policy.status && reviewStatuses.some(status => 
      policy.status?.toLowerCase().trim() === status.toLowerCase()
    );
    
    if (!needsReview) return false;
    
    // Super-admins and publishers can see all policies needing review
    if (isSuperAdmin || userRole === 'publish') {
      return true;
    }
    
    return false;
  });

  // Publishers and super admins can publish any policy
  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const canArchive = isSuperAdmin || userRole === 'publish';

  const handleEditPolicy = (policyId: string) => {
    setEditingPolicyId(policyId);
    setViewingPolicyId(null);
  };

  const handleViewPolicy = (policyId: string) => {
    setViewingPolicyId(policyId);
    setEditingPolicyId(null);
  };

  const handlePolicyUpdated = (updatedPolicy: Policy) => {
    setEditingPolicyId(null);
    // Refresh the policy list
    fetchPolicies();
  };

  const handleCancelEdit = () => {
    setEditingPolicyId(null);
  };

  const handleCloseView = () => {
    setViewingPolicyId(null);
  };

  const handleArchivePolicy = async (policyId: string) => {
    if (canArchive) {
      await archivePolicy(policyId);
    }
  };

  const handleUpdateStatus = async (policyId: string, newStatus: string) => {
    console.log('=== HANDLE UPDATE STATUS ===', { policyId, newStatus });
    await updatePolicyStatus(policyId, newStatus);
  };

  // Force refresh function to reload policies from database
  const handleRefresh = () => {
    console.log('=== FORCE REFRESHING POLICIES ===');
    fetchPolicies();
  };

  if (!canPublish) {
    return (
      <ReviewPoliciesAccessDenied
        userRole={userRole}
        canPublish={canPublish}
        isSuperAdmin={isSuperAdmin}
      />
    );
  }

  // Show edit form if editing a policy
  if (editingPolicyId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Policy</h2>
          <p className="text-muted-foreground">
            Make changes to the policy and save when ready.
          </p>
        </div>

        <PolicyEditForm
          policyId={editingPolicyId}
          onPolicyUpdated={handlePolicyUpdated}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReviewPoliciesHeader
        policies={policies}
        reviewPolicies={reviewPolicies}
        userRole={userRole}
        currentUserId={currentUser?.id}
        isLoadingPolicies={isLoadingPolicies}
        canPublish={canPublish}
        isSuperAdmin={isSuperAdmin}
        showDebugInfo={showDebugInfo}
        onToggleDebugInfo={() => setShowDebugInfo(!showDebugInfo)}
        onRefresh={handleRefresh}
      />

      {/* Show message if no policies need review */}
      {reviewPolicies.length === 0 ? (
        <ReviewPoliciesEmptyState
          policies={policies}
          userRole={userRole}
          isLoadingPolicies={isLoadingPolicies}
        />
      ) : (
        /* Policy list */
        <PolicyList
          policies={reviewPolicies}
          isLoading={isLoadingPolicies}
          isEditor={false}
          canPublish={true}
          editingPolicyId={editingPolicyId}
          onUpdateStatus={handleUpdateStatus}
          onEdit={handleEditPolicy}
          onView={handleViewPolicy}
          onDelete={isSuperAdmin ? deletePolicy : undefined}
          onArchive={canArchive ? handleArchivePolicy : undefined}
        />
      )}

      {viewingPolicyId && (
        <PolicyViewModal
          policyId={viewingPolicyId}
          onClose={handleCloseView}
          onEdit={handleEditPolicy}
          onUpdateStatus={handleUpdateStatus}
          onRefresh={fetchPolicies}
        />
      )}
    </div>
  );
}
