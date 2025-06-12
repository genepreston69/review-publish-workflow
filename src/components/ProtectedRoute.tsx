
import { useAuth } from '@/hooks/useAuth';
import { useAzureAuth } from '@/hooks/useAzureAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Try to get auth from both providers
  let currentUser, userRole, isLoading;
  
  try {
    const azureAuth = useAzureAuth();
    currentUser = azureAuth.currentUser;
    userRole = azureAuth.userRole;
    isLoading = azureAuth.isLoading;
  } catch {
    // Fallback to Supabase auth if Azure is not available
    const supabaseAuth = useAuth();
    currentUser = supabaseAuth.currentUser;
    userRole = supabaseAuth.userRole;
    isLoading = supabaseAuth.isLoading;
  }

  const location = useLocation();

  if (isLoading) {
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
