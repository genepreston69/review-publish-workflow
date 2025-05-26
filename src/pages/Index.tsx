
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ContentSidebar } from '@/components/ContentSidebar';
import { DebugTest } from '@/components/DebugTest';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

const Index = () => {
  console.log('=== INDEX PAGE RENDERING ===');
  
  return (
    <div className="min-h-screen">
      <DebugTest />
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <ContentSidebar />
          <SidebarInset className="flex-1">
            <Header />
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-white">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Content Dashboard</h1>
            </div>
            <Dashboard />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
