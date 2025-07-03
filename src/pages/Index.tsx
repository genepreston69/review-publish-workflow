
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/RoleBadge';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { User, LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Index = () => {
  console.log('=== INDEX PAGE RENDERING ===');
  
  const { currentUser, signOut } = useAuth();
  const { userRole } = useUserRole();

  const handleLogout = async () => {
    await signOut();
  };

  // Get user name from metadata or email
  const userName = currentUser?.user_metadata?.name || 
                  currentUser?.email?.split('@')[0] || 
                  'User';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 z-10">
            <header className="border-b bg-white">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Content Dashboard</h1>
                  </div>
                  
                  {currentUser && userRole && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{userName}</span>
                        <RoleBadge role={userRole} />
                      </div>
                      <div className="flex items-center gap-2">
                        {userRole === 'super-admin' && (
                          <Link to="/admin">
                            <Button variant="outline" size="sm">
                              <Shield className="w-4 h-4 mr-1" />
                              Admin
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-1" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>
          </div>
          <div className="flex-1 overflow-auto">
            <Dashboard />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
