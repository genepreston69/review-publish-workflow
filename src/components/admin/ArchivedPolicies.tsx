
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PolicyList } from './policy/PolicyList';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { usePolicies } from './policy/usePolicies';
import { useQuery } from '@tanstack/react-query';
import { fetchArchivedPolicies } from './policy/policyFetcher';
import { useInfiniteLoopProtection } from '@/hooks/useInfiniteLoopProtection';
import { useSafeCallback } from '@/hooks/useSafeCallback';

export function ArchivedPolicies() {
  // Add infinite loop protection
  useInfiniteLoopProtection({
    componentName: 'ArchivedPolicies',
    maxRenders: 15
  });

  const { userRole } = useAuth();
  const { updatePolicyStatus, deletePolicy } = usePolicies();
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);

  const { data: archivedPolicies = [], isLoading, refetch } = useQuery({
    queryKey: ['archived-policies'],
    queryFn: fetchArchivedPolicies,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Prevent excessive refetching
  });

  const isSuperAdmin = userRole === 'super-admin';

  console.log('=== ARCHIVED POLICIES COMPONENT ===');
  console.log('Archived Policies count:', archivedPolicies.length);
  console.log('Is loading:', isLoading);
  console.log('User role:', userRole);

  const handleViewPolicy = useSafeCallback((policyId: string) => {
    console.log('View archived policy:', policyId);
    setViewingPolicyId(policyId);
  }, [], {
    name: 'handleViewPolicy',
    maxCalls: 10
  });

  const handleCloseView = useSafeCallback(() => {
    setViewingPolicyId(null);
  }, [], {
    name: 'handleCloseView'
  });

  const handleRestorePolicy = useSafeCallback(async (policyId: string) => {
    console.log('=== RESTORING ARCHIVED POLICY ===', policyId);
    // Restore by setting archived_at to null and status to draft
    await updatePolicyStatus(policyId, 'draft');
    // Refresh the archived policies list
    await refetch();
  }, [updatePolicyStatus, refetch], {
    name: 'handleRestorePolicy',
    maxCalls: 5
  });

  const handleDeletePolicy = useSafeCallback(async (policyId: string) => {
    console.log('=== DELETING ARCHIVED POLICY ===', policyId);
    await deletePolicy(policyId);
    // Refresh the archived policies list
    await refetch();
  }, [deletePolicy, refetch], {
    name: 'handleDeletePolicy',
    maxCalls: 5
  });

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Archived Policies</h2>
          <p className="text-muted-foreground">
            You need super-admin access to view archived policies.
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

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : archivedPolicies.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-4 text-lg font-medium">No archived policies found</h3>
          <p className="text-gray-500">No policies have been archived yet.</p>
        </div>
      ) : (
        <PolicyList
          policies={archivedPolicies}
          isLoading={isLoading}
          isEditor={false}
          canPublish={false}
          onUpdateStatus={handleRestorePolicy}
          onView={handleViewPolicy}
          onDelete={handleDeletePolicy}
        />
      )}

      {viewingPolicyId && (
        <PolicyViewModal
          policyId={viewingPolicyId}
          onClose={handleCloseView}
          onUpdateStatus={updatePolicyStatus}
          onRefresh={refetch}
        />
      )}
    </div>
  );
}
