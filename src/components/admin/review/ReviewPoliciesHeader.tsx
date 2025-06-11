
import { Policy } from '../policy/types';
import { UserRole } from '@/types/user';
import { ReviewPoliciesDebugInfo } from './ReviewPoliciesDebugInfo';

interface ReviewPoliciesHeaderProps {
  policies: Policy[];
  reviewPolicies: Policy[];
  userRole: UserRole | null;
  currentUserId?: string;
  isLoadingPolicies: boolean;
  canPublish: boolean;
  isSuperAdmin: boolean;
  showDebugInfo: boolean;
  onToggleDebugInfo: () => void;
  onRefresh: () => void;
}

export function ReviewPoliciesHeader({
  policies,
  reviewPolicies,
  userRole,
  currentUserId,
  isLoadingPolicies,
  canPublish,
  isSuperAdmin,
  showDebugInfo,
  onToggleDebugInfo,
  onRefresh
}: ReviewPoliciesHeaderProps) {
  return (
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
            onClick={onToggleDebugInfo}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {showDebugInfo ? 'Hide' : 'Show'} debug info
          </button>
          
          {/* Debug info */}
          {showDebugInfo && (
            <ReviewPoliciesDebugInfo
              policies={policies}
              reviewPolicies={reviewPolicies}
              userRole={userRole}
              currentUserId={currentUserId}
              isLoadingPolicies={isLoadingPolicies}
              canPublish={canPublish}
              isSuperAdmin={isSuperAdmin}
            />
          )}
        </div>
      </div>
      <button
        onClick={onRefresh}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
      >
        Refresh
      </button>
    </div>
  );
}
