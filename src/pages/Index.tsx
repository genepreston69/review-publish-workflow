
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ContentSidebar } from '@/components/ContentSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

const Index = () => {
  console.log('=== INDEX PAGE START ===');
  console.log('Index page rendering...');
  console.log('About to render ContentSidebar...');
  
  try {
    console.log('=== STARTING RETURN BLOCK ===');
    return (
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
    );
  } catch (error) {
    console.error('=== ERROR IN INDEX RENDER ===', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-red-600">
          <h1>Error rendering page</h1>
          <pre>{String(error)}</pre>
        </div>
      </div>
    );
  }
};

export default Index;
