
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams } from 'react-router-dom';
import { UserManagement } from '@/components/admin/UserManagement';
import { AssignmentManagement } from '@/components/admin/AssignmentManagement';
import { SystemAnalytics } from '@/components/admin/SystemAnalytics';
import { ContentModeration } from '@/components/admin/ContentModeration';
import { FacilityPolicies } from '@/components/admin/FacilityPolicies';
import { CreatePolicy } from '@/components/admin/CreatePolicy';
import { DraftPolicies } from '@/components/admin/DraftPolicies';
import { ReviewPolicies } from '@/components/admin/ReviewPolicies';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Shield, Users, Link, BarChart3, FileText, Plus, FileClock, FileCheck } from 'lucide-react';

const Admin = () => {
  const { userRole, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'create-policy');

  // Update tab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  // Determine which tabs to show based on role
  const isEditor = userRole === 'edit';
  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isSuperAdmin = userRole === 'super-admin';

  const getPageTitle = () => {
    if (userRole === 'super-admin') return 'Super Admin Dashboard';
    if (userRole === 'publish') return 'Publisher Dashboard';
    if (userRole === 'edit') return 'Editor Dashboard';
    return 'Dashboard';
  };

  // Calculate grid columns based on visible tabs
  const getTabsGridCols = () => {
    if (isSuperAdmin) {
      // For super admin: Create Policy + Users + Assignments + Analytics = 4 tabs
      return 'grid-cols-4';
    }
    
    let cols = 2; // Create Policy + Facility Policies
    if (isEditor) cols += 1; // Draft Policies
    if (canPublish && !isEditor) cols += 1; // Review Policies
    return `grid-cols-${cols}`;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {isSuperAdmin ? (
          <div className="fixed left-0 top-0 h-screen z-20">
            <AdminSidebar onTabChange={handleTabChange} activeTab={activeTab} />
          </div>
        ) : (
          // Simple sidebar for non-super-admin users - make it fixed
          <div className="fixed left-0 top-0 h-screen w-64 border-r bg-white z-20 overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                <span className="font-semibold text-lg">Policy Manager</span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('create-policy')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'create-policy' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create Policy
                </button>
                {isEditor && (
                  <button
                    onClick={() => setActiveTab('draft-policies')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === 'draft-policies' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <FileClock className="w-4 h-4 inline mr-2" />
                    Draft Policies
                  </button>
                )}
                {canPublish && !isEditor && (
                  <button
                    onClick={() => setActiveTab('review-policies')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === 'review-policies' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <FileCheck className="w-4 h-4 inline mr-2" />
                    Review Policies
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('facility-policies')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'facility-policies' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Facility Policies
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 flex flex-col ml-64">
          <div className="sticky top-0 z-10 bg-white border-b">
            <Header />
            <div className="flex items-center gap-2 px-4 py-2 border-b">
              {isSuperAdmin && <SidebarTrigger />}
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {isSuperAdmin ? (
                <TabsList className={`grid w-full ${getTabsGridCols()} mb-8`}>
                  <TabsTrigger value="create-policy" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Policy
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    User Management
                  </TabsTrigger>
                  <TabsTrigger value="assignments" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Assignments
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              ) : (
                <TabsList className={`grid w-full ${getTabsGridCols()} mb-8`}>
                  <TabsTrigger value="create-policy" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Policy
                  </TabsTrigger>
                  {isEditor && (
                    <TabsTrigger value="draft-policies" className="flex items-center gap-2">
                      <FileClock className="w-4 h-4" />
                      Draft Policies
                    </TabsTrigger>
                  )}
                  {canPublish && !isEditor && (
                    <TabsTrigger value="review-policies" className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4" />
                      Review Policies
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="facility-policies" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Facility Policies
                  </TabsTrigger>
                </TabsList>
              )}

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
