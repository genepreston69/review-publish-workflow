
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PolicyManualGenerator } from './admin/policy/PolicyManualGenerator';
import { FacilityPoliciesGrid } from './admin/policy/FacilityPoliciesGrid';
import { FacilityPoliciesEmptyState } from './admin/policy/FacilityPoliciesEmptyState';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useAppNavigation } from '@/hooks/useAppNavigation';

// New imports for refactored components
import { useContentManagement } from '@/hooks/useContentManagement';
import { useAllUserPolicies } from '@/hooks/useAllUserPolicies';
import { useDashboardActions } from './dashboard/DashboardActions';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { ContentGrid } from './dashboard/ContentGrid';

export const Dashboard = () => {
  const { currentUser, userRole } = useAuth();
  const { activeSection } = useAppNavigation();
  const canCreate = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  // Use custom hooks for data management
  const { contents, isLoading, handlePublish } = useContentManagement(currentUser, userRole);
  const { hrPolicies, facilityPolicies, isLoadingPolicies } = useAllUserPolicies();
  
  // Use action handlers
  const {
    handleCreateNew,
    handleEdit,
    handleView,
    handlePolicyView,
    handlePolicyUpdateStatus,
    handlePolicyDelete,
  } = useDashboardActions();

  // Debug logging
  console.log('=== DASHBOARD RENDER ===');
  console.log('Active Section:', activeSection);
  console.log('HR Policies count:', hrPolicies.length);
  console.log('Facility Policies count:', facilityPolicies.length);

  if (isLoading || isLoadingPolicies) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      </div>
    );
  }

  const draftContents = contents.filter(c => c.status === 'draft');
  const reviewContents = contents.filter(c => c.status === 'under-review');
  const publishedContents = contents.filter(c => c.status === 'published');

  const renderContent = () => {
    console.log('=== RENDER CONTENT ===');
    console.log('Rendering for activeSection:', activeSection);
    
    switch (activeSection) {
      case 'all':
        return (
          <ContentGrid
            contents={contents}
            onEdit={handleEdit}
            onView={handleView}
            onPublish={handlePublish}
            emptyMessage={`No content found for your role (${userRole}). ${canCreate ? " Create your first piece of content to get started." : ""}`}
          />
        );

      case 'drafts':
        return (
          <ContentGrid
            contents={draftContents}
            onEdit={handleEdit}
            onView={handleView}
            onPublish={handlePublish}
            emptyMessage="No draft content found."
          />
        );

      case 'review':
        return (
          <ContentGrid
            contents={reviewContents}
            onEdit={handleEdit}
            onView={handleView}
            onPublish={handlePublish}
            emptyMessage="No content under review."
          />
        );

      case 'published':
        return (
          <ContentGrid
            contents={publishedContents}
            onEdit={handleEdit}
            onView={handleView}
            onPublish={handlePublish}
            emptyMessage="No published content found."
          />
        );

      case 'hr-policies':
        console.log('=== RENDERING HR POLICIES ===', hrPolicies.length);
        return hrPolicies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No HR policies found.</p>
          </div>
        ) : (
          <FacilityPoliciesGrid
            policies={hrPolicies}
            isEditor={false}
            canPublish={false}
            isSuperAdmin={false}
            onView={handlePolicyView}
            onUpdateStatus={handlePolicyUpdateStatus}
            onDelete={handlePolicyDelete}
          />
        );

      case 'facility-policies':
        console.log('=== RENDERING FACILITY POLICIES ===', facilityPolicies.length);
        return facilityPolicies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No facility policies found.</p>
          </div>
        ) : (
          <FacilityPoliciesGrid
            policies={facilityPolicies}
            isEditor={false}
            canPublish={false}
            isSuperAdmin={false}
            onView={handlePolicyView}
            onUpdateStatus={handlePolicyUpdateStatus}
            onDelete={handlePolicyDelete}
          />
        );

      case 'policy-manuals':
        return <PolicyManualGenerator />;

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a section from the sidebar to view content.</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader 
        userRole={userRole}
        canCreate={canCreate}
        onCreateNew={handleCreateNew}
      />
      
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};
