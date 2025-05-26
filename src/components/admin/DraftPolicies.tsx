
import { useAuth } from '@/hooks/useAuth';
import { PolicyList } from './policy/PolicyList';
import { usePolicies } from './policy/usePolicies';

export function DraftPolicies() {
  const { userRole } = useAuth();
  const { policies, isLoadingPolicies, updatePolicyStatus } = usePolicies();

  // Filter to show only draft policies for the current user
  const draftPolicies = policies.filter(policy => policy.status === 'draft');

  const hasEditAccess = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Draft Policies</h2>
        <p className="text-muted-foreground">
          Manage your draft policies before they are sent for review.
        </p>
      </div>

      <PolicyList
        policies={draftPolicies}
        isLoading={isLoadingPolicies}
        isEditor={true}
        canPublish={false}
        onUpdateStatus={updatePolicyStatus}
      />
    </div>
  );
}
