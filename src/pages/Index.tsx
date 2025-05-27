
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ContentSidebar } from '@/components/ContentSidebar';

const Index = () => {
  console.log('=== INDEX PAGE RENDERING ===');
  
  return (
    <div className="min-h-screen flex bg-gray-50">
      <ContentSidebar />
      <div className="flex-1">
        <Header />
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
