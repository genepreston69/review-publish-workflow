
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyList } from './policy/PolicyList';
import { PolicyEditForm } from './policy/PolicyEditForm';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { usePolicies } from './policy/usePolicies';
import { Policy } from './policy/types';

export function ReviewPolicies() {
  const { currentUser, userRole } = useAuth();
  const { policies, isLoadingPolicies, updatePolicyStatus, deletePolicy, archivePolicy, isSuperAdmin, fetchPolicies } = usePolicies();
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);

  // All possible status variations that need review
  const reviewStatuses = ['draft', 'under-review', 'under review', 'awaiting-changes', 'awaiting changes'];

  // Filter to show policies that need review with proper access control
  const reviewPolicies = policies.filter(policy => {
    // Check if policy needs review (case-insensitive and flexible matching)
    const needsReview = policy.status && reviewStatuses.some(status => 
      policy.status?.toLowerCase().trim() === status.toLowerCase()
    );
    
    if (!needsReview) return false;
    
    // Super-admins can see all policies needing review
    if (isSuperAdmin) {
      return true;
    }
    
    // Publishers can see policies assigned to them or that they can review
    if (userRole === 'publish') {
      // Don't show policies they created (maker/checker rule)
      if (policy.creator_id === currentUser?.id) {
        return false;
      }
      
      // Show if assigned as reviewer or if no specific reviewer assigned
      const canReview = policy.reviewer === currentUser?.email || !policy.reviewer;
      return canReview;
    }
    
    return false;
  });

  // Super admins can publish any policy, publishers follow maker/checker rules
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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Policies</h2>
          <p className="text-muted-foreground">
            You need publish access or higher to review policies.
          </p>
        </div>
      </div>
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
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Review Policies</h2>
            <p className="text-muted-foreground">
              Review and approve policies for publication. This includes draft policies ready for review and policies awaiting changes.
              {!isSuperAdmin && " (You cannot review policies you created due to maker/checker controls)"}
            </p>
            {reviewPolicies.length > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                <p>Showing {reviewPolicies.length} {reviewPolicies.length === 1 ? 'policy' : 'policies'} awaiting review</p>
                <div className="flex gap-4 mt-1">
                  <span>Draft: {reviewPolicies.filter(p => p.status?.toLowerCase() === 'draft').length}</span>
                  <span>Under Review: {reviewPolicies.filter(p => p.status?.toLowerCase().includes('under')).length}</span>
                  <span>Awaiting Changes: {reviewPolicies.filter(p => p.status?.toLowerCase().includes('awaiting')).length}</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

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
