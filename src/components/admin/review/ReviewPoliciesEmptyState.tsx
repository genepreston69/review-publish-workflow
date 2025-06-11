
import { Policy } from '../policy/types';
import { UserRole } from '@/types/user';

interface ReviewPoliciesEmptyStateProps {
  policies: Policy[];
  userRole: UserRole | null;
  isLoadingPolicies: boolean;
}

export function ReviewPoliciesEmptyState({ 
  policies, 
  userRole, 
  isLoadingPolicies 
}: ReviewPoliciesEmptyStateProps) {
  if (isLoadingPolicies) return null;

  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No policies need review</h3>
      <p className="mt-1 text-sm text-gray-500">
        {policies.length === 0 
          ? "No policies have been created yet." 
          : "All policies are either published or archived."}
      </p>
      {policies.length > 0 && (
        <div className="mt-2 text-xs text-gray-400 space-y-1">
          <p>Try refreshing or check other sections like Draft Policies to create policies that need review.</p>
          <p className="text-red-500">
            <strong>Debug:</strong> Found {policies.length} total policies, but none match review criteria for role "{userRole}"
          </p>
        </div>
      )}
    </div>
  );
}
