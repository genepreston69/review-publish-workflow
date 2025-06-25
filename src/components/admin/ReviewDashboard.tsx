
import { useState } from 'react';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { PolicyList } from './policy/PolicyList';
import { PolicyViewModal } from './policy/PolicyViewModal';
import { usePolicies } from './policy/usePolicies';
import { Policy } from './policy/types';
import { Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function ReviewDashboard() {
  const { currentUser, userRole } = useAuth();
  const { policies, isLoadingPolicies, updatePolicyStatus, fetchPolicies } = usePolicies();
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);

  // Filter policies that need review by policy-reviewer role
  const reviewPolicies = policies.filter(policy => {
    // Show policies with "Pending Review" status
    return policy.status === 'under-review' || policy.status === 'pending-review';
  });

  const handleViewPolicy = (policyId: string) => {
    setViewingPolicyId(policyId);
  };

  const handleCloseView = () => {
    setViewingPolicyId(null);
  };

  const handleApprovePolicy = async (policyId: string) => {
    console.log('=== APPROVING POLICY ===', policyId);
    try {
      await updatePolicyStatus(policyId, 'approved');
    } catch (error) {
      console.error('Error approving policy:', error);
    }
  };

  const handleRejectPolicy = async (policyId: string, comment?: string) => {
    console.log('=== REJECTING POLICY ===', policyId, comment);
    try {
      await updatePolicyStatus(policyId, 'rejected', comment);
    } catch (error) {
      console.error('Error rejecting policy:', error);
    }
  };

  const handleRefresh = () => {
    console.log('=== REFRESHING REVIEW DASHBOARD ===');
    fetchPolicies();
  };

  return (
    <RoleProtectedRoute requiredRole="policy-reviewer">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Review Dashboard</h2>
            <p className="text-muted-foreground">
              Review policies submitted for approval. You can approve policies to move them to the publish queue or reject them back to the editor.
            </p>
            {reviewPolicies.length > 0 && (
              <div className="text-sm text-gray-600 mt-2">
                <p>You have {reviewPolicies.length} {reviewPolicies.length === 1 ? 'policy' : 'policies'} awaiting review</p>
                <div className="flex gap-4 mt-1">
                  <span>Under Review: {reviewPolicies.filter(p => p.status === 'under-review').length}</span>
                  <span>Pending Review: {reviewPolicies.filter(p => p.status === 'pending-review').length}</span>
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {reviewPolicies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No policies to review</h3>
              <p className="text-gray-600 text-center">
                All policies have been reviewed. Check back later for new submissions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviewPolicies.map((policy) => (
              <Card key={policy.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{policy.name || 'Untitled Policy'}</h3>
                      <Badge variant={policy.status === 'under-review' ? 'default' : 'secondary'}>
                        {policy.status === 'under-review' ? 'Under Review' : 'Pending Review'}
                      </Badge>
                      <Badge variant="outline">{policy.policy_type}</Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Policy Number: {policy.policy_number || 'Not assigned'}</p>
                      <p>Created: {new Date(policy.created_at).toLocaleDateString()}</p>
                      <p>Creator: {policy.creator?.name || 'Unknown'}</p>
                    </div>

                    {policy.purpose && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">Purpose:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{policy.purpose}</p>
                      </div>
                    )}

                    {policy.reviewer_comment && (
                      <div className="mb-3 p-3 bg-yellow-50 rounded-md">
                        <p className="text-sm font-medium text-yellow-800">Previous Review Comment:</p>
                        <p className="text-sm text-yellow-700">{policy.reviewer_comment}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPolicy(policy.id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprovePolicy(policy.id)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRejectPolicy(policy.id, 'Requires changes before approval')}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {viewingPolicyId && (
          <PolicyViewModal
            policyId={viewingPolicyId}
            onClose={handleCloseView}
            onUpdateStatus={async (policyId, newStatus, comment) => {
              if (newStatus === 'approved') {
                await handleApprovePolicy(policyId);
              } else if (newStatus === 'rejected') {
                await handleRejectPolicy(policyId, comment);
              } else {
                await updatePolicyStatus(policyId, newStatus, comment);
              }
            }}
            onRefresh={fetchPolicies}
          />
        )}
      </div>
    </RoleProtectedRoute>
  );
}
