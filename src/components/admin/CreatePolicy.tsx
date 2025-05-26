
import { useAuth } from '@/hooks/useAuth';
import { CreatePolicyForm } from './policy/CreatePolicyForm';
import { PolicyList } from './policy/PolicyList';
import { usePolicies } from './policy/usePolicies';

export function CreatePolicy() {
  const { userRole } = useAuth();
  const { policies, isLoadingPolicies, updatePolicyStatus, addPolicy, isEditor, canPublish } = usePolicies();

  // Check if user has edit access
  const hasEditAccess = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  if (!hasEditAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Policy</h2>
          <p className="text-muted-foreground">
            You need edit access or higher to create policies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Policy</h2>
        <p className="text-muted-foreground">
          Create a new facility policy with automatic numbering. {userRole === 'edit' ? 'Your policy will be saved as a draft and assigned to a publisher for review.' : 'Your policy will be created for review.'}
        </p>
      </div>

      <CreatePolicyForm onPolicyCreated={addPolicy} />

      {/* Policy Cards Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            {isEditor && "Your Draft Policies"}
            {canPublish && !isEditor && "Policies Awaiting Review"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isEditor && "Manage your draft policies before they are sent for review"}
            {canPublish && !isEditor && "Review and approve policies for publication"}
          </p>
        </div>

        <PolicyList
          policies={policies}
          isLoading={isLoadingPolicies}
          isEditor={isEditor}
          canPublish={canPublish}
          onUpdateStatus={updatePolicyStatus}
        />
      </div>
    </div>
  );
}
