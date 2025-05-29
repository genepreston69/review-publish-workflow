
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Index = () => {
  console.log('=== INDEX PAGE RENDERING ===');
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
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
  );
};

export default Index;
