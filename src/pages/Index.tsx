
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ContentSidebar } from '@/components/ContentSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

const Index = () => {
  console.log('=== INDEX PAGE START ===');
  console.log('Index page rendering...');
  
  const renderContentSidebar = () => {
    try {
      console.log('=== ATTEMPTING TO RENDER CONTENTSIDEBAR ===');
      return <ContentSidebar />;
    } catch (error) {
      console.error('=== ERROR RENDERING CONTENTSIDEBAR ===', error);
      return (
        <div className="w-64 bg-red-100 p-4">
          <h3 className="text-red-700">Sidebar Error</h3>
          <p className="text-red-600 text-sm">{String(error)}</p>
        </div>
      );
    }
  };

  try {
    console.log('=== STARTING RETURN BLOCK ===');
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          {renderContentSidebar()}
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
