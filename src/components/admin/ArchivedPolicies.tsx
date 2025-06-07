
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyList } from './policy/PolicyList';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { usePolicies } from './policy/usePolicies';
import { useQuery } from '@tanstack/react-query';
import { fetchArchivedPolicies } from './policy/policyFetcher';

export function ArchivedPolicies() {
  const { userRole } = useAuth();
  const { updatePolicyStatus, deletePolicy } = usePolicies();
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);

  const { data: archivedPolicies = [], isLoading } = useQuery({
    queryKey: ['archived-policies'],
    queryFn: fetchArchivedPolicies,
  });

  const isAdmin = userRole === 'admin';

  const handleViewPolicy = (policyId: string) => {
    console.log('View archived policy:', policyId);
    setViewingPolicyId(policyId);
  };

  const handleCloseView = () => {
    setViewingPolicyId(null);
  };

  const handleRestorePolicy = async (policyId: string) => {
    // Restore by clearing the archived_at timestamp
    await updatePolicyStatus(policyId, 'draft');
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Archived Policies</h2>
          <p className="text-muted-foreground">
            You need admin access to view archived policies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Archived Policies</h2>
        <p className="text-muted-foreground">
          View and manage archived policies. You can restore policies or permanently delete them.
        </p>
        {archivedPolicies.length > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            <p>Showing {archivedPolicies.length} archived {archivedPolicies.length === 1 ? 'policy' : 'policies'}</p>
          </div>
        )}
      </div>

      <PolicyList
        policies={archivedPolicies}
        isLoading={isLoading}
        isEditor={false}
        canPublish={false}
        onUpdateStatus={handleRestorePolicy}
        onView={handleViewPolicy}
        onDelete={deletePolicy}
      />

      {viewingPolicyId && (
        <PolicyViewModal
          policyId={viewingPolicyId}
          onClose={handleCloseView}
          onUpdateStatus={updatePolicyStatus}
        />
      )}
    </div>
  );
}
