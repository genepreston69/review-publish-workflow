
import { useAuth } from '@/components/SafeAuthProvider';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect all admin users (editors, publishers, and super-admins) to admin dashboard if they're on the root path
  if (location.pathname === '/' && (role === 'edit' || role === 'publish' || role === 'super-admin')) {
    const defaultTab = role === 'super-admin' ? 'users' : 'create-policy';
    return <Navigate to={`/admin?tab=${defaultTab}`} replace />;
  }

  return <>{children}</>;
};
