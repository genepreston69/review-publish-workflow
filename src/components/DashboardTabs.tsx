
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, CheckCircle, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function DashboardTabs() {
  const { userRole } = useAuth();
  
  // For read-only users, show only Published Policies and Policy Manuals
  if (userRole === 'read-only') {
    return (
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="published" className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Published Policies
        </TabsTrigger>
        <TabsTrigger value="policy-manuals" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Policy Manuals
        </TabsTrigger>
      </TabsList>
    );
  }

  // For other users, show all tabs
  return (
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger value="all" className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        All
      </TabsTrigger>
      <TabsTrigger value="drafts" className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        Drafts
      </TabsTrigger>
      <TabsTrigger value="review" className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        Under Review
      </TabsTrigger>
      <TabsTrigger value="published" className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        Published
      </TabsTrigger>
      <TabsTrigger value="policy-manuals" className="flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Policy Manuals
      </TabsTrigger>
    </TabsList>
  );
}
