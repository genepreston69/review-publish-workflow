
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileClock, FileCheck, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function DashboardTabs() {
  const { userRole } = useAuth();
  
  const isEditor = userRole === 'edit';
  const canPublish = userRole === 'publish' || userRole === 'super-admin';

  return (
    <TabsList className="grid w-full grid-cols-4 mb-8">
      <TabsTrigger value="all" className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        All Content
      </TabsTrigger>
      <TabsTrigger value="drafts" className="flex items-center gap-2">
        <FileClock className="w-4 h-4" />
        Drafts
      </TabsTrigger>
      <TabsTrigger value="review" className="flex items-center gap-2">
        <FileCheck className="w-4 h-4" />
        Under Review
      </TabsTrigger>
      <TabsTrigger value="published" className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Published
      </TabsTrigger>
    </TabsList>
  );
}
