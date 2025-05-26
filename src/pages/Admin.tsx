
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { UserManagement } from '@/components/admin/UserManagement';
import { AssignmentManagement } from '@/components/admin/AssignmentManagement';
import { SystemAnalytics } from '@/components/admin/SystemAnalytics';
import { ContentModeration } from '@/components/admin/ContentModeration';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Shield, Users, Link, BarChart3, FileText } from 'lucide-react';

const Admin = () => {
  const { userRole, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('directors-report');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Only super-admins can access this page
  if (userRole !== 'super-admin') {
    return <Navigate to="/" replace />;
  }

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar onTabChange={handleTabChange} activeTab={activeTab} />
        <SidebarInset className="flex-1">
          <Header />
          <div className="flex items-center gap-2 px-4 py-2 border-b">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <h1 className="text-lg font-semibold">Super Admin Dashboard</h1>
            </div>
          </div>
          
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="directors-report" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Director's Report
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
                <TabsTrigger value="moderation" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Content Moderation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="directors-report">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Director's Report</h2>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-600">Director's report content will be displayed here.</p>
                  </div>
                </div>
              </TabsContent>

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
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
