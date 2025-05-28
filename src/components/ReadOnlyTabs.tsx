
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock, CheckCircle, BookOpen } from 'lucide-react';

export function ReadOnlyTabs() {
  return (
    <TabsList className="grid w-full grid-cols-4 mb-8">
      <TabsTrigger value="all" className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        All Content
      </TabsTrigger>
      <TabsTrigger value="policies" className="flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Policies
      </TabsTrigger>
      <TabsTrigger value="recent" className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Recent
      </TabsTrigger>
      <TabsTrigger value="published" className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        Published
      </TabsTrigger>
    </TabsList>
  );
}
