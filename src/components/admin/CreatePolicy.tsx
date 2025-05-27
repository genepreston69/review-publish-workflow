
import { useAuth } from '@/hooks/useAuth';
import { CreatePolicyForm } from './policy/CreatePolicyForm';
import { usePolicies } from './policy/usePolicies';
import { Loader2 } from 'lucide-react';

export function CreatePolicy() {
  const { userRole, isLoading } = useAuth();
  const { addPolicy } = usePolicies();

  console.log('=== CREATE POLICY COMPONENT ===', { userRole, isLoading });

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  // Check if user has edit access
  const hasEditAccess = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  console.log('=== ACCESS CHECK ===', { userRole, hasEditAccess });

  if (!hasEditAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Policy</h2>
          <p className="text-muted-foreground">
            You need edit access or higher to create policies. Current role: {userRole || 'unknown'}
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
