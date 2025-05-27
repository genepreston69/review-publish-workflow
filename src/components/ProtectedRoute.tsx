
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, userRole, isLoading } = useAuth();
  const location = useLocation();

  console.log('=== PROTECTED ROUTE CHECK ===', {
    currentUser: !!currentUser,
    userRole,
    isLoading,
    pathname: location.pathname,
    timestamp: new Date().toISOString()
  });

  if (isLoading) {
    console.log('=== PROTECTED ROUTE: SHOWING LOADING ===');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('=== PROTECTED ROUTE: NO USER, REDIRECTING TO AUTH ===');
    return <Navigate to="/auth" replace />;
  }

  console.log('=== PROTECTED ROUTE: USER AUTHENTICATED, SHOWING CONTENT ===');
  return <>{children}</>;
};
