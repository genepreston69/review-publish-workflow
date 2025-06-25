
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { PolicyList } from './policy/PolicyList';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { PolicyEditorHeader } from './policy/PolicyEditorHeader';
import { PolicyEditorEmptyState } from './policy/PolicyEditorEmptyState';
import { PolicyEditorCreateForm } from './policy/PolicyEditorCreateForm';
import { PolicyEditorEditForm } from './policy/PolicyEditorEditForm';
import { usePolicyEditorLogic } from './policy/usePolicyEditorLogic';

export function PolicyEditor() {
  const {
    editorPolicies,
    isLoadingPolicies,
    editingPolicyId,
    viewingPolicyId,
    showCreateForm,
    userRole,
    handleEditPolicy,
    handleViewPolicy,
    handlePolicyUpdated,
    handleCancelEdit,
    handleCloseView,
    handleCreateNew,
    handleUpdateStatus,
    handleDeletePolicy,
    handleRefresh,
    handlePolicyCreated,
    handleBackToList,
    fetchPolicies
  } = usePolicyEditorLogic();

  // Show create form
  if (showCreateForm) {
    return (
      <RoleProtectedRoute requiredRole="edit" allowedRoles={['policy-maker']}>
        <PolicyEditorCreateForm
          onPolicyCreated={handlePolicyCreated}
          onBackToList={handleBackToList}
        />
      </RoleProtectedRoute>
    );
  }

  // Show edit form if editing a policy
  if (editingPolicyId) {
    return (
      <RoleProtectedRoute requiredRole="edit" allowedRoles={['policy-maker']}>
        <PolicyEditorEditForm
          editingPolicyId={editingPolicyId}
          onPolicyUpdated={handlePolicyUpdated}
          onCancel={handleCancelEdit}
        />
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute requiredRole="edit" allowedRoles={['policy-maker']}>
      <div className="space-y-6">
        <PolicyEditorHeader
          editorPoliciesCount={editorPolicies.length}
          draftCount={editorPolicies.filter(p => p.status === 'draft').length}
          rejectedCount={editorPolicies.filter(p => p.status === 'rejected').length}
          awaitingChangesCount={editorPolicies.filter(p => p.status === 'awaiting-changes').length}
          onCreateNew={handleCreateNew}
          onRefresh={handleRefresh}
        />

        {editorPolicies.length === 0 ? (
          <PolicyEditorEmptyState onCreateNew={handleCreateNew} />
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
