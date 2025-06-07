
import { useAuth } from '@/hooks/useAuth';
import { usePublishedPolicies } from '@/hooks/usePublishedPolicies';
import { ContentSidebar } from './ContentSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, BarChart3 } from 'lucide-react';

export const Dashboard = () => {
  const { userRole } = useAuth();
  const { hrPolicies, facilityPolicies, isLoadingPolicies } = usePublishedPolicies(userRole);

  // Show content management for all users except readonly
  if (userRole && userRole !== 'readonly') {
    return <ContentSidebar />;
  }

  // For readonly users, show a dashboard with policy stats
  const canViewAdmin = userRole === 'publish' || userRole === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your policy management dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HR Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPolicies ? '...' : hrPolicies.length}
            </div>
            <p className="text-xs text-muted-foreground">Published policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facility Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPolicies ? '...' : facilityPolicies.length}
            </div>
            <p className="text-xs text-muted-foreground">Published policies</p>
          </CardContent>
        </Card>

        {canViewAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Management</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">System status</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Available</div>
                <p className="text-xs text-muted-foreground">Reporting tools</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity or Policy Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hrPolicies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent HR Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hrPolicies.slice(0, 5).map((policy) => (
                  <div key={policy.id} className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{policy.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {facilityPolicies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Facility Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {facilityPolicies.slice(0, 5).map((policy) => (
                  <div key={policy.id} className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{policy.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
