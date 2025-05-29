
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Content } from '@/types/content';
import { UserRole } from '@/types/user';

export const useContentManagement = (currentUser: any, userRole: UserRole | null) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  useEffect(() => {
    if (currentUser && userRole) {
      console.log('=== DASHBOARD USEEFFECT: FETCHING CONTENT ===', { currentUser: !!currentUser, userRole });
      fetchContents();
    }
  }, [currentUser, userRole]);

  return {
    contents,
    isLoading,
    fetchContents,
    handlePublish,
  };
};
