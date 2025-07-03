
import { useAuth } from '@/hooks/useAuth';
import { usePublishedPolicies } from '@/hooks/usePublishedPolicies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FacilityPoliciesGrid } from '@/components/admin/policy/FacilityPoliciesGrid';
import { PolicyList } from '@/components/admin/policy/PolicyList';
import { PolicyViewModal } from '@/components/admin/policy/PolicyViewModal';
import { useState } from 'react';
import { FileText, Shield, Users, BarChart3 } from 'lucide-react';
import { Policy } from '@/components/admin/policy/types';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid, List, LayoutGrid } from 'lucide-react';
import { PolicyManualGenerator } from './admin/policy/PolicyManualGenerator';

export function Dashboard() {
  console.log('=== DASHBOARD RENDERING ===');
  
  const { userRole } = useAuth();
  const { activeSection } = useAppNavigation();
  const { hrPolicies, facilityPolicies, isLoadingPolicies } = usePublishedPolicies(userRole);
  const [viewingPolicyId, setViewingPolicyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');

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

  // Handle policy manuals section for ALL user roles
  if (activeSection === 'policy-manuals') {
    return (
      <div className="flex-1 space-y-6 p-6">
        <PolicyManualGenerator />
      </div>
    );
  }

  // For read-only users, show published policies based on active section
  if (userRole === 'read-only') {
    const totalPolicies = hrPolicies.length + facilityPolicies.length;
    const fullHrPolicies = hrPolicies.map(convertToFullPolicy);
    const fullFacilityPolicies = facilityPolicies.map(convertToFullPolicy);
    
    // Show specific section based on navigation
    if (activeSection === 'hr-policies') {
      return (
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">HR Policies</h1>
              <p className="text-muted-foreground">
                Human resources policies and procedures
              </p>
              {fullHrPolicies.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {fullHrPolicies.length} published HR {fullHrPolicies.length === 1 ? 'policy' : 'policies'}
                </p>
              )}
            </div>

            {/* View Mode Toggle */}
            {fullHrPolicies.length > 0 && (
              <div className="flex items-center gap-2">
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list' | 'compact')}>
                  <ToggleGroupItem value="grid" aria-label="Grid view">
                    <Grid className="h-4 w-4" />
                    Grid
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view">
                    <List className="h-4 w-4" />
                    List
                  </ToggleGroupItem>
                  <ToggleGroupItem value="compact" aria-label="Compact view">
                    <LayoutGrid className="h-4 w-4" />
                    Compact
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}
          </div>

          {fullHrPolicies.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Users className="mx-auto h-8 w-8 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium">No published HR policies</h4>
                  <p className="text-xs text-gray-500">
                    HR policies will appear here when published
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === 'list' ? (
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
              ) : (
                <FacilityPoliciesGrid
                  policies={fullHrPolicies}
                  isEditor={false}
                  canPublish={false}
                  isSuperAdmin={false}
                  compact={viewMode === 'compact'}
                  hideHeader={true}
                  onView={handleViewPolicy}
                  onUpdateStatus={() => {}} // Read-only users can't update status
                  onDelete={() => {}} // Read-only users can't delete
                />
              )}
            </>
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

    if (activeSection === 'facility-policies') {
      return (
        <div className="flex-1 space-y-6 p-6">
          <FacilityPoliciesGrid
            policies={fullFacilityPolicies}
            isEditor={false}
            canPublish={false}
            isSuperAdmin={false}
            onView={handleViewPolicy}
            onUpdateStatus={() => {}} // Read-only users can't update status
            onDelete={() => {}} // Read-only users can't delete
          />

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

    // Default dashboard view with stats cards
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
