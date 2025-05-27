
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ContentSidebar } from '@/components/ContentSidebar';

const Index = () => {
  console.log('=== INDEX PAGE RENDERING ===');
  
  const [activeView, setActiveView] = useState<'content' | 'policies'>('content');
  
  return (
    <div className="min-h-screen flex bg-gray-50">
      <ContentSidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1">
        <Header />
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
