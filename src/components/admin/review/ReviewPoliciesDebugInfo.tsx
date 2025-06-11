
import { Policy } from '../policy/types';
import { UserRole } from '@/types/user';

interface ReviewPoliciesDebugInfoProps {
  policies: Policy[];
  reviewPolicies: Policy[];
  userRole: UserRole | null;
  currentUserId?: string;
  isLoadingPolicies: boolean;
  canPublish: boolean;
  isSuperAdmin: boolean;
}

export function ReviewPoliciesDebugInfo({ 
  policies, 
  reviewPolicies, 
  userRole, 
  currentUserId, 
  isLoadingPolicies, 
  canPublish, 
  isSuperAdmin 
}: ReviewPoliciesDebugInfoProps) {
  const policyStatusCounts = policies.reduce((acc, policy) => {
    const status = policy.status?.toLowerCase() || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
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
        <p><strong>Is Super Admin:</strong> {isSuperAdmin ? 'Yes' : 'No'}</p>
        <p><strong>Is Loading:</strong> {isLoadingPolicies ? 'Yes' : 'No'}</p>
        <p><strong>Current User ID:</strong> {currentUserId || 'Not logged in'}</p>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <h5 className="font-medium mb-1">Sample Policies (first 3):</h5>
        {policies.slice(0, 3).map((policy, index) => (
          <div key={policy.id} className="text-xs mb-1">
            <p><strong>Policy {index + 1}:</strong> {policy.name || 'Untitled'}</p>
            <p>Status: {policy.status || 'No status'}</p>
            <p>Creator: {policy.creator_id || 'No creator'}</p>
            <p>---</p>
          </div>
        ))}
      </div>
    </div>
  );
}
