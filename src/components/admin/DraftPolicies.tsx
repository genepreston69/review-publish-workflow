
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyList } from './policy/PolicyList';
import { PolicyEditForm } from './policy/PolicyEditForm';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { usePolicies } from './policy/usePolicies';
import { Policy } from './policy/types';

export function DraftPolicies() {
  const { currentUser, userRole } = useAuth();
  const { policies, isLoadingPolicies, updatePolicyStatus, deletePolicy, archivePolicy, isAdmin, fetchPolicies } = usePolicies();
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);

  // Filter to show user-specific drafts based on role
  const draftPolicies = policies.filter(policy => {
    const isDraft = policy.status === 'draft' || policy.status === 'awaiting-changes';
    
    if (!isDraft) return false;
    
    // Admins can see all drafts
    if (isAdmin) return true;
    
    // Editors can only see their own drafts
    if (userRole === 'edit') {
      return policy.creator_id === currentUser?.id;
    }
    
    // Publishers can see drafts assigned to them for review or their own
    if (userRole === 'publish') {
      return policy.creator_id === currentUser?.id || 
             policy.reviewer === currentUser?.email ||
             policy.publisher_id === currentUser?.id;
    }
    
    return false;
  });

  const canEdit = userRole === 'edit' || userRole === 'publish' || userRole === 'admin';
  const canDelete = isAdmin;
  const canArchive = isAdmin;

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

  if (!canEdit) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Draft Policies</h2>
          <p className="text-muted-foreground">
            You need edit access or higher to view draft policies.
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
        <h2 className="text-2xl font-bold tracking-tight">Draft Policies</h2>
        <p className="text-muted-foreground">
          {userRole === 'edit' && "Manage your draft policies. Submit them for review when ready."}
          {userRole === 'publish' && "View drafts you've created or have been assigned to review."}
          {isAdmin && "Manage all draft policies in the system."}
        </p>
        {draftPolicies.length > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            <p>Showing {draftPolicies.length} {draftPolicies.length === 1 ? 'policy' : 'policies'}</p>
            <div className="flex gap-4 mt-1">
              <span>Draft: {draftPolicies.filter(p => p.status === 'draft').length}</span>
              <span>Awaiting Changes: {draftPolicies.filter(p => p.status === 'awaiting-changes').length}</span>
            </div>
          </div>
        )}
      </div>

      <PolicyList
        policies={draftPolicies}
        isLoading={isLoadingPolicies}
        isEditor={userRole === 'edit'}
        canPublish={userRole === 'publish' || userRole === 'admin'}
        editingPolicyId={editingPolicyId}
        onUpdateStatus={updatePolicyStatus}
        onEdit={handleEditPolicy}
        onView={handleViewPolicy}
        onDelete={canDelete ? deletePolicy : undefined}
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
