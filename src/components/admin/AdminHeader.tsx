
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/RoleBadge';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  isSuperAdmin: boolean;
  pageTitle: string;
}

export function AdminHeader({ isSuperAdmin, pageTitle }: AdminHeaderProps) {
  const { currentUser, userRole, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  // Get user name from metadata or email
  const userName = currentUser?.user_metadata?.name || 
                  currentUser?.email?.split('@')[0] || 
                  'User';

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 bg-white border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex-1">
        <h1 className="font-semibold">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        {currentUser && userRole && (
          <>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">{userName}</span>
              <RoleBadge role={userRole} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
