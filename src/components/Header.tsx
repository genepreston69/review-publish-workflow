
import { Button } from '@/components/ui/button';
import { RoleBadge } from './RoleBadge';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = () => {
  const { user, userRole, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  // Get user name from metadata or email
  const userName = user?.user_metadata?.name || 
                  user?.email?.split('@')[0] || 
                  'User';

  return (
    <header className="border-b bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/574646d6-6de7-444f-a9a2-327c1a816521.png" 
                alt="Recovery Point West Virginia" 
                className="h-8 w-auto"
              />
            </Link>
          </div>
          {user && userRole && (
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
  );
};
