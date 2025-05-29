
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  console.log('=== INDEX PAGE RENDERING ===');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b">
        <Header />
        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <h1 className="text-lg font-semibold">Content Dashboard</h1>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
