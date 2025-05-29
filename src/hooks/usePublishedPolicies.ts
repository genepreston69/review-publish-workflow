
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/user';

interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  policy_text: string | null;
  procedure: string | null;
  purpose: string | null;
  reviewer: string | null;
  status: string | null;
  created_at: string;
}

export const usePublishedPolicies = (userRole: UserRole | null) => {
  const [publishedPolicies, setPublishedPolicies] = useState<Policy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const { toast } = useToast();

  const fetchPublishedPolicies = async () => {
    if (userRole !== 'read-only') return;

    try {
      console.log('=== FETCHING PUBLISHED POLICIES FOR READ-ONLY USER ===');
      setIsLoadingPolicies(true);
      
      const { data, error } = await supabase
        .from('Policies')
        .select('*')
        .eq('status', 'published')
        .order('policy_number', { ascending: true });

      if (error) {
        console.error('Error fetching published policies:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load published policies.",
        });
        return;
      }

      console.log('=== PUBLISHED POLICIES FETCHED ===', data);
      setPublishedPolicies(data || []);
    } catch (error) {
      console.error('Error fetching published policies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  useEffect(() => {
    if (userRole === 'read-only') {
      fetchPublishedPolicies();
    }
  }, [userRole]);

  return {
    publishedPolicies,
    isLoadingPolicies,
  };
};
