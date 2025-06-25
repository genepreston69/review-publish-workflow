
import { useState } from 'react';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { PolicyList } from './policy/PolicyList';
import { PolicyEditForm } from './policy/PolicyEditForm';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { usePolicies } from './policy/usePolicies';
import { Policy } from './policy/types';
import { Plus, FileText } from 'lucide-react';
import { CreatePolicyForm } from './policy/CreatePolicyForm';

export function PolicyEditor() {
  const { currentUser, userRole } = useAuth();
  const { policies, isLoadingPolicies, updatePolicyStatus, deletePolicy, fetchPolicies } = usePolicies();
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter policies for policy-makers (only their own drafts and rejected policies)
  const editorPolicies = policies.filter(policy => {
    // Show policies created by current user that are in editable states
    return policy.creator_id === currentUser?.id && 
           (policy.status === 'draft' || 
            policy.status === 'rejected' || 
            policy.status === 'awaiting-changes');
  });

  const handleEditPolicy = (policyId: string) => {
    setEditingPolicyId(policyId);
    setViewingPolicyId(null);
    setShowCreateForm(false);
  };

  const handleViewPolicy = (policyId: string) => {
    setViewingPolicyId(policyId);
    setEditingPolicyId(null);
    setShowCreateForm(false);
  };

  const handlePolicyUpdated = (updatedPolicy: Policy) => {
    setEditingPolicyId(null);
    fetchPolicies();
  };

  const handleCancelEdit = () => {
    setEditingPolicyId(null);
  };

  const handleCloseView = () => {
    setViewingPolicyId(null);
  };

  const handleCreateNew = () => {
    setShowCreateForm(true);
    setEditingPolicyId(null);
    setViewingPolicyId(null);
  };

  const handleUpdateStatus = async (policyId: string, newStatus: string) => {
    console.log('=== POLICY EDITOR UPDATE STATUS ===', { policyId, newStatus });
    try {
      await updatePolicyStatus(policyId, newStatus);
    } catch (error) {
      console.error('Error updating policy status:', error);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    console.log('=== POLICY EDITOR DELETE POLICY ===', policyId);
    await deletePolicy(policyId);
  };

  const handleRefresh = () => {
    console.log('=== POLICY EDITOR REFRESHING ===');
    fetchPolicies();
  };

  // Show create form
  if (showCreateForm) {
    return (
      <RoleProtectedRoute requiredRole="edit" allowedRoles={['policy-maker']}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Create New Policy</h2>
              <p className="text-muted-foreground">
                Create a new policy that will be saved as draft.
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Back to My Policies
            </Button>
          </div>

          <CreatePolicyForm 
            onPolicyCreated={() => {
              setShowCreateForm(false);
              fetchPolicies();
            }}
          />
        </div>
      </RoleProtectedRoute>
    );
  }

  // Show edit form if editing a policy
  if (editingPolicyId) {
    return (
      <RoleProtectedRoute requiredRole="edit" allowedRoles={['policy-maker']}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Edit Policy</h2>
              <p className="text-muted-foreground">
                Make changes to your policy and save when ready.
              </p>
            </div>
            <Button variant="outline" onClick={handleCancelEdit}>
              Back to My Policies
            </Button>
          </div>

          <PolicyEditForm
            policyId={editingPolicyId}
            onPolicyUpdated={handlePolicyUpdated}
            onCancel={handleCancelEdit}
          />
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute requiredRole="edit" allowedRoles={['policy-maker']}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Policy Editor</h2>
            <p className="text-muted-foreground">
              Create and edit your policy drafts. You can only edit policies you've created that are in draft, rejected, or awaiting-changes status.
            </p>
            {editorPolicies.length > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                <p>You have {editorPolicies.length} {editorPolicies.length === 1 ? 'policy' : 'policies'} to work on</p>
                <div className="flex gap-4 mt-1">
                  <span>Drafts: {editorPolicies.filter(p => p.status === 'draft').length}</span>
                  <span>Rejected: {editorPolicies.filter(p => p.status === 'rejected').length}</span>
                  <span>Awaiting Changes: {editorPolicies.filter(p => p.status === 'awaiting-changes').length}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Policy
            </Button>
            <Button variant="outline" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </div>

        {editorPolicies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No policies to edit</h3>
              <p className="text-gray-600 text-center mb-4">
                You don't have any policies in draft, rejected, or awaiting-changes status.
              </p>
              <Button onClick={handleCreateNew} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Policy
              </Button>
            </CardContent>
          </Card>
        ) : (
          <PolicyList
            policies={editorPolicies}
            isLoading={isLoadingPolicies}
            isEditor={true}
            canPublish={false}
            editingPolicyId={editingPolicyId}
            onUpdateStatus={handleUpdateStatus}
            onEdit={handleEditPolicy}
            onView={handleViewPolicy}
            onDelete={userRole === 'super-admin' ? handleDeletePolicy : undefined}
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
    </RoleProtectedRoute>
  );
}
