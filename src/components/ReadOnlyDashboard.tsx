
import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ReadOnlyTabs } from './ReadOnlyTabs';
import { ReadOnlyDashboardHeader } from './ReadOnlyDashboardHeader';
import { ReadOnlyContentGrid } from './ReadOnlyContentGrid';
import { useReadOnlyData } from '@/hooks/useReadOnlyData';
import { Content } from '@/types/content';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { filterContents, filterPolicies, convertPoliciesToContent } from '@/utils/readOnlyDataUtils';

export const ReadOnlyDashboard = () => {
  const { contents, policies, isLoading } = useReadOnlyData();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleView = (content: Content) => {
    toast({
      title: "Feature coming soon",
      description: "Content viewing will be implemented next.",
    });
  };

  const filteredContents = filterContents(contents, searchTerm);
  const filteredPolicies = filterPolicies(policies, searchTerm);
  const convertedPolicies = convertPoliciesToContent(filteredPolicies);

  const recentContents = [...filteredContents].slice(0, 6);
  const allItems = [...filteredContents, ...convertedPolicies];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReadOnlyDashboardHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Tabs defaultValue="all" className="w-full">
        <ReadOnlyTabs />

        <TabsContent value="all" className="mt-6">
          <ReadOnlyContentGrid
            items={allItems}
            onView={handleView}
            emptyMessage="No content available."
          />
        </TabsContent>

        <TabsContent value="policies" className="mt-6">
          <ReadOnlyContentGrid
            items={convertedPolicies}
            onView={handleView}
            emptyMessage="No policies found."
          />
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <ReadOnlyContentGrid
            items={recentContents}
            onView={handleView}
            emptyMessage="No recent content found."
          />
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <ReadOnlyContentGrid
            items={filteredContents}
            onView={handleView}
            emptyMessage="No published content found."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
