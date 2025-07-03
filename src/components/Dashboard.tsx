
import { useAuth } from '@/hooks/useAuth';
import { usePublishedPolicies } from '@/hooks/usePublishedPolicies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FacilityPoliciesGrid } from '@/components/admin/policy/FacilityPoliciesGrid';
import { PolicyList } from '@/components/admin/policy/PolicyList';
import { PolicyViewModal } from '@/components/admin/policy/PolicyViewModal';
import { useState } from 'react';
import { FileText, Shield, Users, BarChart3 } from 'lucide-react';
import { Policy } from '@/components/admin/policy/types';

export function Dashboard() {
  console.log('=== DASHBOARD RENDERING ===');
  
  const { userRole } = useAuth();
  const { hrPolicies, facilityPolicies, isLoadingPolicies } = usePublishedPolicies(userRole);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);

  const handleViewPolicy = (policyId: string) => {
    console.log('View policy:', policyId);
    setViewingPolicyId(policyId);
  };

  const handleCloseView = () => {
    setViewingPolicyId(null);
  };

  // Convert the simplified policies to full Policy type for read-only users
  const convertToFullPolicy = (policy: any): Policy => ({
    id: policy.id,
    name: policy.name,
    policy_number: policy.policy_number,
    policy_type: policy.policy_type,
    purpose: policy.purpose,
    policy_text: policy.policy_text,
    procedure: policy.procedure,
    reviewer: policy.reviewer,
    created_at: policy.created_at,
    status: policy.status,
    creator_id: null,
    publisher_id: null,
    reviewer_comment: null,
    published_at: null,
    updated_at: null,
    archived_at: null,
    parent_policy_id: null,
    creator: null,
    publisher: null,
  });

  // For read-only users, show published policies
  if (userRole === 'read-only') {
    const totalPolicies = hrPolicies.length + facilityPolicies.length;
    const fullHrPolicies = hrPolicies.map(convertToFullPolicy);
    const fullFacilityPolicies = facilityPolicies.map(convertToFullPolicy);
    
    return (
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Policy Library</h1>
          <p className="text-muted-foreground">
            Browse and view published organizational policies and procedures.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPolicies}</div>
              <p className="text-xs text-muted-foreground">Published policies</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">HR Policies</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hrPolicies.length}</div>
              <p className="text-xs text-muted-foreground">Human resources</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facility Policies</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilityPolicies.length}</div>
              <p className="text-xs text-muted-foreground">Operations & safety</p>
            </CardContent>
          </Card>
        </div>

        {/* HR Policies Section */}
        {hrPolicies.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">HR Policies</h2>
              <p className="text-slate-600">Human resources policies and procedures</p>
            </div>
            <PolicyList
              policies={fullHrPolicies}
              isLoading={isLoadingPolicies}
              isEditor={false}
              canPublish={false}
              onUpdateStatus={() => {}} // Read-only users can't update status
              onEdit={() => {}} // Read-only users can't edit
              onView={handleViewPolicy}
              onDelete={undefined} // Read-only users can't delete
            />
          </div>
        )}

        {/* Facility Policies Section */}
        {facilityPolicies.length > 0 && (
          <FacilityPoliciesGrid
            policies={fullFacilityPolicies}
            isEditor={false}
            canPublish={false}
            isSuperAdmin={false}
            onView={handleViewPolicy}
            onUpdateStatus={() => {}} // Read-only users can't update status
            onDelete={() => {}} // Read-only users can't delete
          />
        )}

        {/* Empty State */}
        {totalPolicies === 0 && !isLoadingPolicies && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="mx-auto h-8 w-8 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium">No published policies</h4>
                <p className="text-xs text-gray-500">
                  Published policies will appear here when available
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoadingPolicies && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Policy View Modal */}
        {viewingPolicyId && (
          <PolicyViewModal
            policyId={viewingPolicyId}
            onClose={handleCloseView}
            onEdit={() => {}} // Read-only users can't edit
            onUpdateStatus={() => {}} // Read-only users can't update status
          />
        )}
      </div>
    );
  }

  // For other user roles, show the regular dashboard content
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your content management dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Content
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Content items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Published
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Published items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Draft
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Draft items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Under Review
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
