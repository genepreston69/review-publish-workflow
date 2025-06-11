
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

  // Debug info about all policies
  const policyStatusCounts = policies.reduce((acc, policy) => {
    const status = policy.status?.toLowerCase() || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
              Review and approve policies for publication. Publishers can review and publish all policies.
            </p>
            
            {/* Show counts and status */}
            <div className="mt-3 space-y-2">
              <div className="text-sm text-gray-600">
                <p>Total policies loaded: <span className="font-medium">{policies.length}</span></p>
                <p>Policies awaiting review: <span className="font-medium">{reviewPolicies.length}</span></p>
                {reviewPolicies.length > 0 && (
                  <div className="flex gap-4 mt-1">
                    <span>Draft: {reviewPolicies.filter(p => p.status?.toLowerCase() === 'draft').length}</span>
                    <span>Under Review: {reviewPolicies.filter(p => p.status?.toLowerCase().includes('under')).length}</span>
                    <span>Awaiting Changes: {reviewPolicies.filter(p => p.status?.toLowerCase().includes('awaiting')).length}</span>
                  </div>
                )}
              </div>
              
              {/* Debug toggle */}
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {showDebugInfo ? 'Hide' : 'Show'} debug info
              </button>
              
              {/* Debug info */}
              {showDebugInfo && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs">
                  <h4 className="font-medium mb-2">All Policy Status Counts:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(policyStatusCounts).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span className="capitalize">{status}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p><strong>User Role:</strong> {userRole}</p>
                    <p><strong>Can Publish:</strong> {canPublish ? 'Yes' : 'No'}</p>
                    <p><strong>Is Loading:</strong> {isLoadingPolicies ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Show message if no policies need review */}
      {!isLoadingPolicies && reviewPolicies.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No policies need review</h3>
          <p className="mt-1 text-sm text-gray-500">
            {policies.length === 0 
              ? "No policies have been created yet." 
              : "All policies are either published or archived."}
          </p>
          {policies.length > 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Try refreshing or check other sections like Draft Policies to create policies that need review.
            </p>
          )}
        </div>
      )}

      {/* Policy list */}
      {reviewPolicies.length > 0 && (
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
