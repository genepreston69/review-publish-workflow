
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ContentSidebar } from '@/components/ContentSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

const Index = () => {
  console.log('=== INDEX PAGE RENDERING ===');
  
  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <ContentSidebar />
          <div className="flex-1 flex flex-col ml-64">
            <div className="sticky top-0 z-10 bg-white border-b">
              <Header />
              <div className="flex items-center gap-2 px-4 py-2 border-b">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Content Dashboard</h1>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <Dashboard />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
