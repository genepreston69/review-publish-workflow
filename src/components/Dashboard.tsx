
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { DashboardTabs } from './DashboardTabs';
import { PolicyManualGenerator } from './admin/policy/PolicyManualGenerator';
import { FacilityPoliciesGrid } from './admin/policy/FacilityPoliciesGrid';
import { FacilityPoliciesEmptyState } from './admin/policy/FacilityPoliciesEmptyState';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// New imports for refactored components
import { useContentManagement } from '@/hooks/useContentManagement';
import { usePublishedPolicies } from '@/hooks/usePublishedPolicies';
import { useDashboardActions } from './dashboard/DashboardActions';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { ContentGrid } from './dashboard/ContentGrid';

export const Dashboard = () => {
  const { currentUser, userRole } = useAuth();
  const canCreate = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  // Use custom hooks for data management
  const { contents, isLoading, handlePublish } = useContentManagement(currentUser, userRole);
  const { publishedPolicies, isLoadingPolicies } = usePublishedPolicies(userRole);
  
  // Use action handlers
  const {
    handleCreateNew,
    handleEdit,
    handleView,
    handlePolicyView,
    handlePolicyUpdateStatus,
    handlePolicyDelete,
  } = useDashboardActions();

  if (isLoading || (userRole === 'read-only' && isLoadingPolicies)) {
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

  // Set default tab based on user role
  const defaultTab = userRole === 'read-only' ? 'published' : 'all';

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader 
        userRole={userRole}
        canCreate={canCreate}
        onCreateNew={handleCreateNew}
      />

      <Tabs defaultValue={defaultTab} className="w-full">
        <DashboardTabs />

        {/* Only show these tabs for non-read-only users */}
        {userRole !== 'read-only' && (
          <>
            <TabsContent value="all" className="mt-6">
              <ContentGrid
                contents={contents}
                onEdit={handleEdit}
                onView={handleView}
                onPublish={handlePublish}
                emptyMessage={`No content found for your role (${userRole}). ${canCreate ? " Create your first piece of content to get started." : ""}`}
              />
            </TabsContent>

            <TabsContent value="drafts" className="mt-6">
              <ContentGrid
                contents={draftContents}
                onEdit={handleEdit}
                onView={handleView}
                onPublish={handlePublish}
                emptyMessage="No draft content found."
              />
            </TabsContent>

            <TabsContent value="review" className="mt-6">
              <ContentGrid
                contents={reviewContents}
                onEdit={handleEdit}
                onView={handleView}
                onPublish={handlePublish}
                emptyMessage="No content under review."
              />
            </TabsContent>
          </>
        )}

        <TabsContent value="published" className="mt-6">
          {userRole === 'read-only' ? (
            // For read-only users, show published policies from Policies table
            publishedPolicies.length === 0 ? (
              <FacilityPoliciesEmptyState />
            ) : (
              <FacilityPoliciesGrid
                policies={publishedPolicies}
                isEditor={false}
                canPublish={false}
                isSuperAdmin={false}
                onView={handlePolicyView}
                onUpdateStatus={handlePolicyUpdateStatus}
                onDelete={handlePolicyDelete}
              />
            )
          ) : (
            // For other users, show published content from content table
            <ContentGrid
              contents={publishedContents}
              onEdit={handleEdit}
              onView={handleView}
              onPublish={handlePublish}
              emptyMessage="No published content found."
            />
          )}
        </TabsContent>

        <TabsContent value="policy-manuals" className="mt-6">
          <PolicyManualGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};
