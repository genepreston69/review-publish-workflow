
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Content } from '@/types/content';
import { useToast } from '@/hooks/use-toast';

export const useReadOnlyData = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
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
    fetchData();
  }, []);

  return { contents, policies, isLoading, refetch: fetchData };
};
