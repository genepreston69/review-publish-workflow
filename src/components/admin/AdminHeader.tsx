
import { Bell, Settings, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface AdminHeaderProps {
  isSuperAdmin: boolean;
  pageTitle: string;
}

export const AdminHeader = ({ isSuperAdmin, pageTitle }: AdminHeaderProps) => {
  const { currentUser, userRole, refreshUserRole } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshRole = async () => {
    if (refreshUserRole) {
      setIsRefreshing(true);
      try {
        await refreshUserRole();
        console.log('=== MANUAL ROLE REFRESH COMPLETED ===');
      } catch (error) {
        console.error('=== MANUAL ROLE REFRESH FAILED ===', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          {isSuperAdmin && (
            <Badge variant="destructive" className="text-xs">
              Super Admin
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Role Debug Info */}
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span>Role: {userRole}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshRole}
              disabled={isRefreshing}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {currentUser?.email || 'Unknown User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
