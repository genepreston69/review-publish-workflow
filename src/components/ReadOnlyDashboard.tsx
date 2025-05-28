
import { useState, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ReadOnlyTabs } from './ReadOnlyTabs';
import { ReadOnlyContentCard } from './ReadOnlyContentCard';
import { useAuth } from '@/hooks/useAuth';
import { Content } from '@/types/content';
import { Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export const ReadOnlyDashboard = () => {
  const { currentUser, userRole } = useAuth();
  const [contents, setContents] = useState<Content[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchContents = async () => {
    try {
      setIsLoading(true);
      
      // Fetch published content
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (contentError) {
        console.error('Error fetching content:', contentError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load content.",
        });
        return;
      }

      // Fetch policies - corrected table name from 'policies' to 'Policies'
      const { data: policyData, error: policyError } = await supabase
        .from('Policies')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (policyError) {
        console.error('Error fetching policies:', policyError);
      }

      // Convert content data
      const mappedContents: Content[] = (contentData || []).map(item => ({
        id: item.id,
        title: item.title,
        body: item.body,
        status: item.status as 'draft' | 'under-review' | 'published',
        authorId: item.author_id,
        assignedPublisherId: item.assigned_publisher_id || undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        publishedAt: item.published_at ? new Date(item.published_at) : undefined,
      }));

      setContents(mappedContents);
      setPolicies(policyData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleView = (content: Content) => {
    toast({
      title: "Feature coming soon",
      description: "Content viewing will be implemented next.",
    });
  };

  const filteredContents = contents.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPolicies = policies.filter(policy =>
    policy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.policy_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentContents = [...filteredContents].slice(0, 6);
  const allItems = [...filteredContents, ...filteredPolicies.map(policy => ({
    id: policy.id,
    title: policy.name || 'Untitled Policy',
    body: policy.policy_text || '',
    status: 'published' as const,
    authorId: '',
    createdAt: new Date(policy.created_at),
    updatedAt: new Date(policy.created_at),
    publishedAt: new Date(policy.created_at),
  }))];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Center</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Access published policies, procedures, and content. Stay informed with the latest updates and guidelines.
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search content and policies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <ReadOnlyTabs />

        <TabsContent value="all" className="mt-6">
          {allItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No content available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allItems.map((item) => (
                <ReadOnlyContentCard
                  key={item.id}
                  content={item}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="policies" className="mt-6">
          {filteredPolicies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No policies found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPolicies.map((policy) => (
                <ReadOnlyContentCard
                  key={policy.id}
                  content={{
                    id: policy.id,
                    title: policy.name || 'Untitled Policy',
                    body: policy.policy_text || '',
                    status: 'published' as const,
                    authorId: '',
                    createdAt: new Date(policy.created_at),
                    updatedAt: new Date(policy.created_at),
                    publishedAt: new Date(policy.created_at),
                  }}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {recentContents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No recent content found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentContents.map((content) => (
                <ReadOnlyContentCard
                  key={content.id}
                  content={content}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          {filteredContents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No published content found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContents.map((content) => (
                <ReadOnlyContentCard
                  key={content.id}
                  content={content}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
