
import { useAuth } from '@/hooks/useAuth';
import { CreatePolicyForm } from './policy/CreatePolicyForm';
import { usePolicies } from './policy/usePolicies';

export function CreatePolicy() {
  const { userRole } = useAuth();
  const { addPolicy } = usePolicies();

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
    </div>
  );
}
