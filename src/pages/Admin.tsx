
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { UserManagement } from '@/components/admin/UserManagement';
import { AssignmentManagement } from '@/components/admin/AssignmentManagement';
import { SystemAnalytics } from '@/components/admin/SystemAnalytics';
import { ContentModeration } from '@/components/admin/ContentModeration';
import { FacilityPolicies } from '@/components/admin/FacilityPolicies';
import { CreatePolicy } from '@/components/admin/CreatePolicy';
import { DraftPolicies } from '@/components/admin/DraftPolicies';
import { ReviewPolicies } from '@/components/admin/ReviewPolicies';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { PolicySidebar } from '@/components/admin/PolicySidebar';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminLogic } from '@/hooks/useAdminLogic';

const Admin = () => {
  const { userRole, isLoading } = useAuth();
  const {
    activeTab,
    setActiveTab,
    isEditor,
    canPublish,
    isSuperAdmin,
    getPageTitle,
    getTabsGridCols,
    handleTabChange
  } = useAdminLogic();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Allow editors, publishers, and super-admins to access this page
  const hasAccess = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {isSuperAdmin ? (
          <AdminSidebar onTabChange={handleTabChange} activeTab={activeTab} />
        ) : (
          <PolicySidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isEditor={isEditor}
            canPublish={canPublish}
          />
        )}
        
        <div className="flex-1 flex flex-col ml-64">
          <AdminHeader isSuperAdmin={isSuperAdmin} pageTitle={getPageTitle()} />
          
          <div className="flex-1 overflow-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <AdminTabs 
                isSuperAdmin={isSuperAdmin}
                isEditor={isEditor}
                canPublish={canPublish}
                getTabsGridCols={getTabsGridCols}
              />

              <TabsContent value="create-policy">
                <CreatePolicy />
              </TabsContent>

              <TabsContent value="draft-policies">
                <DraftPolicies />
              </TabsContent>

              <TabsContent value="review-policies">
                <ReviewPolicies />
              </TabsContent>

              <TabsContent value="facility-policies">
                <FacilityPolicies />
              </TabsContent>

              {isSuperAdmin && (
                <>
                  <TabsContent value="users">
                    <UserManagement />
                  </TabsContent>

                  <TabsContent value="assignments">
                    <AssignmentManagement />
                  </TabsContent>

                  <TabsContent value="analytics">
                    <SystemAnalytics />
                  </TabsContent>

                  <TabsContent value="moderation">
                    <ContentModeration />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
