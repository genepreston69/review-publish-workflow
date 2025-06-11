
import { UserRole } from '@/types/user';

interface ReviewPoliciesAccessDeniedProps {
  userRole: UserRole | null;
  canPublish: boolean;
  isSuperAdmin: boolean;
}

export function ReviewPoliciesAccessDenied({ 
  userRole, 
  canPublish, 
  isSuperAdmin 
}: ReviewPoliciesAccessDeniedProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Review Policies</h2>
        <p className="text-muted-foreground">
          You need publish access or higher to review policies.
        </p>
        <div className="mt-3 text-sm text-red-600">
          <p><strong>Debug Info:</strong></p>
          <p>Current User Role: <span className="font-medium">{userRole}</span></p>
          <p>Is Super Admin: <span className="font-medium">{isSuperAdmin ? 'Yes' : 'No'}</span></p>
          <p>Can Publish: <span className="font-medium">{canPublish ? 'Yes' : 'No'}</span></p>
        </div>
      </div>
    </div>
  );
}
