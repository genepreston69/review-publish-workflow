
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentCard } from './ContentCard';
import { useAuth } from '@/hooks/useAuth';
import { Content } from '@/types/content';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const { currentUser, userRole } = useAuth();
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const canCreate = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  const fetchContents = async () => {
    try {
      console.log('=== FETCHING CONTENTS FOR ROLE ===', userRole);
      setIsLoading(true);
      
      let query = supabase.from('content').select('*');
      
      // Different access levels based on role
      if (userRole === 'super-admin') {
        // Super admin can see all content
        console.log('=== SUPER ADMIN: FETCHING ALL CONTENT ===');
      } else if (userRole === 'publish') {
        // Publishers can see all content
        console.log('=== PUBLISHER: FETCHING ALL CONTENT ===');
      } else if (userRole === 'edit') {
        // Editors can see their own content and content assigned to them
        console.log('=== EDITOR: FETCHING OWN AND ASSIGNED CONTENT ===');
        query = query.or(`author_id.eq.${currentUser?.id},assigned_publisher_id.eq.${currentUser?.id}`);
      } else {
        // Read-only users can only see published content
        console.log('=== READ-ONLY: FETCHING PUBLISHED CONTENT ===');
        query = query.eq('status', 'published');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      console.log('=== CONTENT QUERY RESULT ===', { data, error, userRole });

      if (error) {
        console.error('Error fetching content:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load content.",
        });
        return;
      }

      // Convert the data to match our Content type
      const mappedContents: Content[] = (data || []).map(item => ({
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

      console.log('=== MAPPED CONTENTS ===', mappedContents);
      setContents(mappedContents);
    } catch (error) {
      console.error('Error fetching content:', error);
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
    if (currentUser && userRole) {
      console.log('=== DASHBOARD USEEFFECT: FETCHING CONTENT ===', { currentUser: !!currentUser, userRole });
      fetchContents();
    }
  }, [currentUser, userRole]);

  const handleCreateNew = () => {
    console.log('Create new content');
    toast({
      title: "Feature coming soon",
      description: "Content creation will be implemented next.",
    });
  };

  const handleEdit = (content: Content) => {
    console.log('Edit content:', content.id);
    toast({
      title: "Feature coming soon",
      description: "Content editing will be implemented next.",
    });
  };

  const handleView = (content: Content) => {
    console.log('View content:', content.id);
    toast({
      title: "Feature coming soon",
      description: "Content viewing will be implemented next.",
    });
  };

  const handlePublish = async (content: Content) => {
    if (userRole !== 'publish') {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only publishers can publish content.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('content')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', content.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to publish content.",
        });
        return;
      }

      toast({
        title: "Content published",
        description: "The content has been successfully published.",
      });

      // Refresh the content list
      fetchContents();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      </div>
    );
  }

  const draftContents = contents.filter(c => c.status === 'draft');
  const reviewContents = contents.filter(c => c.status === 'under-review');
  const publishedContents = contents.filter(c => c.status === 'published');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600">
            Manage your content across different stages • Role: {userRole}
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Content
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Content ({contents.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftContents.length})</TabsTrigger>
          <TabsTrigger value="review">Under Review ({reviewContents.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedContents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {contents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No content found for your role ({userRole}). 
                {canCreate && " Create your first piece of content to get started."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onEdit={handleEdit}
                  onView={handleView}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          {draftContents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No draft content found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftContents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onEdit={handleEdit}
                  onView={handleView}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          {reviewContents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No content under review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviewContents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onEdit={handleEdit}
                  onView={handleView}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          {publishedContents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No published content found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedContents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onEdit={handleEdit}
                  onView={handleView}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
