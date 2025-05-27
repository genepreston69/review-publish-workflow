
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

  // Define policy tabs that will be horizontal
  const policyTabs = [
    {
      title: "Create Policy",
      icon: Plus,
      tabValue: "create-policy",
    },
    ...(isEditor ? [{
      title: "Draft Policies",
      icon: FileClock,
      tabValue: "draft-policies",
    }] : []),
    ...(canPublish && !isEditor ? [{
      title: "Review Policies",
      icon: FileCheck,
      tabValue: "review-policies",
    }] : []),
    {
      title: "Facility Policies",
      icon: FileText,
      tabValue: "facility-policies",
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {isSuperAdmin && (
          <AdminSidebar onTabChange={handleTabChange} activeTab={activeTab} />
        )}
        
        <SidebarInset className="flex-1">
          <Header />
          <div className="flex items-center gap-2 px-4 py-2 border-b">
            {isSuperAdmin && <SidebarTrigger />}
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
            </div>
          </div>
          
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Policy tabs - always horizontal */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Policy Management</h2>
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-1">
                  {policyTabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.tabValue}
                      value={tab.tabValue} 
                      className="flex items-center gap-2 h-10"
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Super admin tabs - only show if super admin */}
              {isSuperAdmin && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Administration</h2>
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-1">
                    <TabsTrigger value="users" className="flex items-center gap-2 h-10">
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">User Management</span>
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="flex items-center gap-2 h-10">
                      <Link className="w-4 h-4" />
                      <span className="hidden sm:inline">Assignments</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2 h-10">
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Analytics</span>
                    </TabsTrigger>
                    <TabsTrigger value="moderation" className="flex items-center gap-2 h-10">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Moderation</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              )}

              {/* Tab Contents */}
              <div className="mt-6">
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
              </div>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
