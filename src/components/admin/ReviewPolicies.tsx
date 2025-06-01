
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyList } from './policy/PolicyList';
import { PolicyEditForm } from './policy/PolicyEditForm';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { usePolicies } from './policy/usePolicies';
import { Policy } from './policy/types';

export function ReviewPolicies() {
  const { currentUser, userRole } = useAuth();
  const { policies, isLoadingPolicies, updatePolicyStatus, deletePolicy, archivePolicy, isSuperAdmin } = usePolicies();
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);

  // Filter to show policies that need review with proper access control
  const reviewPolicies = policies.filter(policy => {
    const needsReview = policy.status === 'under-review' || 
                       policy.status === 'under review' ||
                       policy.status === 'awaiting-changes';
    
    if (!needsReview) return false;
    
    // Super-admins can see all policies needing review
    if (isSuperAdmin) return true;
    
    // Publishers can see policies assigned to them or that they can review
    if (userRole === 'publish') {
      // Don't show policies they created (maker/checker rule)
      if (policy.creator_id === currentUser?.id) return false;
      
      // Show if assigned as reviewer or if no specific reviewer assigned
      return policy.reviewer === currentUser?.email || !policy.reviewer;
    }
    
    return false;
  });

  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const canArchive = isSuperAdmin;

  const handleEditPolicy = (policyId: string) => {
    console.log('Edit policy:', policyId);
    setEditingPolicyId(policyId);
    setViewingPolicyId(null);
  };

  const handleViewPolicy = (policyId: string) => {
    console.log('View policy:', policyId);
    setViewingPolicyId(policyId);
    setEditingPolicyId(null);
  };

  const handlePolicyUpdated = (updatedPolicy: Policy) => {
    console.log('Policy updated:', updatedPolicy);
    setEditingPolicyId(null);
    // The policy list will automatically refresh from the database
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
        <h2 className="text-2xl font-bold tracking-tight">Review Policies</h2>
        <p className="text-muted-foreground">
          Review and approve policies for publication. You can edit policies before approving them.
          {!isSuperAdmin && " (You cannot review policies you created due to maker/checker controls)"}
        </p>
        {reviewPolicies.length > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            <p>Showing {reviewPolicies.length} {reviewPolicies.length === 1 ? 'policy' : 'policies'} awaiting review</p>
            <div className="flex gap-4 mt-1">
              <span>Under Review: {reviewPolicies.filter(p => p.status === 'under-review' || p.status === 'under review').length}</span>
              <span>Awaiting Changes: {reviewPolicies.filter(p => p.status === 'awaiting-changes').length}</span>
            </div>
          </div>
        )}
      </div>

      <PolicyList
        policies={reviewPolicies}
        isLoading={isLoadingPolicies}
        isEditor={false}
        canPublish={true}
        editingPolicyId={editingPolicyId}
        onUpdateStatus={updatePolicyStatus}
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
          onUpdateStatus={updatePolicyStatus}
        />
      )}
    </div>
  );
}
