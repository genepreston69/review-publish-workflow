
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
  allowedRoles?: string[];
}

export const RoleProtectedRoute = ({ 
  children, 
  requiredRole, 
  allowedRoles = [] 
}: RoleProtectedRouteProps) => {
  const { currentUser, isLoading } = useAuth();
  const { userRole, isLoading: roleLoading } = useUserRole();

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

  // Check if user has the required role or any of the allowed roles
  const hasAccess = userRole === requiredRole || 
                   allowedRoles.includes(userRole || '') ||
                   userRole === 'super-admin'; // Super admin always has access

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              You don't have permission to access this page. This page requires the "{requiredRole}" role
              {allowedRoles.length > 0 && ` or one of: ${allowedRoles.join(', ')}`}.
            </p>
            <p className="text-xs text-gray-500">
              Your current role: <span className="font-medium">{userRole || 'None'}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
