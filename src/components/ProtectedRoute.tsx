
import { useAuth } from '@/components/SafeAuthProvider';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect all admin users (editors, publishers, and super-admins) to admin dashboard if they're on the root path
  if (location.pathname === '/' && (userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin')) {
    const defaultTab = userRole === 'super-admin' ? 'users' : 'create-policy';
    return <Navigate to={`/admin?tab=${defaultTab}`} replace />;
  }

  return <>{children}</>;
};
