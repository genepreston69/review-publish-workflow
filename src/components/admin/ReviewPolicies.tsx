
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyList } from './policy/PolicyList';
import { PolicyEditForm } from './policy/PolicyEditForm';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { usePolicies } from './policy/usePolicies';

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

export function ReviewPolicies() {
  const { userRole } = useAuth();
  const { policies, isLoadingPolicies, updatePolicyStatus, deletePolicy, isSuperAdmin } = usePolicies();
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);

  // Filter to show policies that need review
  const reviewPolicies = policies.filter(policy => 
    policy.status === 'draft' || 
    policy.status === 'under-review' || 
    policy.status === 'under review'
  );

  const canPublish = userRole === 'publish' || userRole === 'super-admin';

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
          Review and approve policies for publication.
        </p>
      </div>

      <PolicyList
        policies={reviewPolicies}
        isLoading={isLoadingPolicies}
        isEditor={false}
        canPublish={true}
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
