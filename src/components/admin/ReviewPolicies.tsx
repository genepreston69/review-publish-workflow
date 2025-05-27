import { useAuth } from '@/hooks/useAuth';
import { PolicyList } from './policy/PolicyList';
import { usePolicies } from './policy/usePolicies';
import { useToast } from '@/hooks/use-toast';

export function ReviewPolicies() {
  const { userRole } = useAuth();
  const { policies, isLoadingPolicies, updatePolicyStatus, deletePolicy, isSuperAdmin } = usePolicies();
  const { toast } = useToast();

  // Filter to show policies that need review
  const reviewPolicies = policies.filter(policy => 
    policy.status === 'draft' || 
    policy.status === 'under-review' || 
    policy.status === 'under review'
  );

  const canPublish = userRole === 'publish' || userRole === 'super-admin';

  const handleEditPolicy = (policyId: string) => {
    // For now, show a toast indicating edit functionality
    toast({
      title: "Edit Policy",
      description: "Policy editing functionality will be implemented next.",
    });
    console.log('Edit policy:', policyId);
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
        onDelete={isSuperAdmin ? deletePolicy : undefined}
      />
    </div>
  );
}
