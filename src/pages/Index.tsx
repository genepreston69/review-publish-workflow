
import { useAuth } from '@/hooks/useAuth';
import { Dashboard } from '@/components/Dashboard';
import { ReadOnlyDashboard } from '@/components/ReadOnlyDashboard';

const Index = () => {
  const { userRole } = useAuth();

  // If the user is not authenticated or role is not loaded, show loading
  if (!userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // For readonly users, show the read-only dashboard
  if (userRole === 'readonly') {
    return <ReadOnlyDashboard />;
  }

  // For editors, publishers, and admins, show the full dashboard
  return <Dashboard />;
};

export default Index;
