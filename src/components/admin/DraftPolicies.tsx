
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyList } from './policy/PolicyList';
import { PolicyEditForm } from './policy/PolicyEditForm';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { usePolicies } from './policy/usePolicies';
import { Policy } from './policy/types';

export function DraftPolicies() {
  const { userRole, currentUser } = useAuth();
  const { policies, isLoadingPolicies, updatePolicyStatus, deletePolicy, isSuperAdmin } = usePolicies();
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);

  // Filter to show only draft policies for the current user (unless super-admin who can see all)
  const draftPolicies = policies.filter(policy => {
    const isDraft = policy.status === 'draft';
    if (isSuperAdmin) {
      return isDraft; // Super-admins can see all drafts
    }
    // Regular users can only see their own drafts
    return isDraft && policy.creator_id === currentUser?.id;
  });

  const hasEditAccess = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

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

  if (!hasEditAccess) {
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
          <h2 className="text-2xl font-bold tracking-tight">Edit Draft Policy</h2>
          <p className="text-muted-foreground">
            Make changes to your draft policy and save when ready.
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
          {isSuperAdmin 
            ? 'Manage all draft policies in the system.' 
            : 'Manage your draft policies before they are sent for review.'
          }
        </p>
        {draftPolicies.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            Showing {draftPolicies.length} draft {draftPolicies.length === 1 ? 'policy' : 'policies'}
          </p>
        )}
      </div>

      <PolicyList
        policies={draftPolicies}
        isLoading={isLoadingPolicies}
        isEditor={true}
        canPublish={false}
        onUpdateStatus={updatePolicyStatus}
        onEdit={handleEditPolicy}
        onView={handleViewPolicy}
        onDelete={isSuperAdmin ? deletePolicy : undefined}
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
