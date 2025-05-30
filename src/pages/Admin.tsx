
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { UserManagement } from '@/components/admin/UserManagement';
import { AssignmentManagement } from '@/components/admin/AssignmentManagement';
import { SystemAnalytics } from '@/components/admin/SystemAnalytics';
import { ContentModeration } from '@/components/admin/ContentModeration';
import { FacilityPolicies } from '@/components/admin/FacilityPolicies';
import { HRPolicies } from '@/components/admin/HRPolicies';
import { CreatePolicy } from '@/components/admin/CreatePolicy';
import { CreateForm } from '@/components/admin/CreateForm';
import { DraftPolicies } from '@/components/admin/DraftPolicies';
import { ReviewPolicies } from '@/components/admin/ReviewPolicies';
import { PolicyManualGenerator } from '@/components/admin/policy/PolicyManualGenerator';
import { AppSidebar } from '@/components/AppSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAppNavigation } from '@/hooks/useAppNavigation';

const Admin = () => {
  const { userRole, isLoading } = useAuth();
  const { activeSection } = useAppNavigation();

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

  const isSuperAdmin = userRole === 'super-admin';

  const getPageTitle = () => {
    if (userRole === 'super-admin') return 'Super Admin Dashboard';
    if (userRole === 'publish') return 'Publisher Dashboard';
    if (userRole === 'edit') return 'Editor Dashboard';
    return 'Dashboard';
  };

  const renderContent = () => {
    console.log('=== ADMIN RENDER CONTENT ===');
    console.log('Active section:', activeSection);
    
    switch (activeSection) {
      case 'create-policy':
        return <CreatePolicy />;
      case 'draft-policies':
        return <DraftPolicies />;
      case 'review-policies':
        return <ReviewPolicies />;
      case 'hr-policies':
        return <HRPolicies />;
      case 'facility-policies':
        return <FacilityPolicies />;
      case 'policy-manuals':
        return <PolicyManualGenerator />;
      case 'create-form':
        return <CreateForm />;
      case 'draft-forms':
        return <div>Draft Forms - Coming Soon</div>;
      case 'review-forms':
        return <div>Review Forms - Coming Soon</div>;
      case 'published-forms':
        return <div>Published Forms - Coming Soon</div>;
      case 'users':
        return <UserManagement />;
      case 'assignments':
        return <AssignmentManagement />;
      case 'analytics':
        return <SystemAnalytics />;
      case 'moderation':
        return <ContentModeration />;
      default:
        return <CreatePolicy />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 z-10">
            <AdminHeader isSuperAdmin={isSuperAdmin} pageTitle={getPageTitle()} />
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
