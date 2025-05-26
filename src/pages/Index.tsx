
import { AuthProvider } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Dashboard />
      </div>
    </AuthProvider>
  );
};

export default Index;
