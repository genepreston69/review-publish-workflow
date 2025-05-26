
import { Button } from '@/components/ui/button';
import { RoleBadge } from './RoleBadge';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut } from 'lucide-react';

export const Header = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Content Management System
            </h1>
          </div>
          {currentUser && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{currentUser.name}</span>
                <RoleBadge role={currentUser.role} />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
