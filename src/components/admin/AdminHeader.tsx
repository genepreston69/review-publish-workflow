
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/RoleBadge';
import { useAuth } from '@/components/SafeAuthProvider';
import { User, LogOut, Shield, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AdminHeaderProps {
  isSuperAdmin: boolean;
  pageTitle: string;
}

export function AdminHeader({ isSuperAdmin, pageTitle }: AdminHeaderProps) {
  const { currentUser, userRole, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const handleManualSessionReset = async () => {
    console.log('🔄 MANUAL SESSION RESET');
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Get user name from metadata or email
  const userName = currentUser?.user_metadata?.name || 
                  currentUser?.email?.split('@')[0] || 
                  'User';

  return (
    <header className="border-b bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
          
          {currentUser && userRole && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{userName}</span>
                <RoleBadge role={userRole} />
              </div>
              <div className="flex items-center gap-2">
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <Shield className="w-4 h-4 mr-1" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSessionReset}
                  title="Reset session for testing"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset Session
                </Button>
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
  );
}
