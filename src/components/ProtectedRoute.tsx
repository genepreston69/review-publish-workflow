
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, isLoading } = useAuth();
  const { userRole, isLoading: roleLoading } = useUserRole();
  const location = useLocation();

  if (isLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect all admin users (editors, publishers, and super-admins) to admin dashboard if they're on the root path
  if (location.pathname === '/' && (userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin')) {
    const defaultTab = userRole === 'super-admin' ? 'users' : 'create-policy';
    return <Navigate to={`/admin?tab=${defaultTab}`} replace />;
  }

  return <>{children}</>;
};
