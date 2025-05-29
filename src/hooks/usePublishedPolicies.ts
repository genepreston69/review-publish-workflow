
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
  policy_type: string | null;
  created_at: string;
}

export const usePublishedPolicies = (userRole: UserRole | null) => {
  const [hrPolicies, setHrPolicies] = useState<Policy[]>([]);
  const [facilityPolicies, setFacilityPolicies] = useState<Policy[]>([]);
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
      
      // Separate HR policies from Facility policies
      const hrPols = (data || []).filter(policy => policy.policy_type === 'HR');
      const facilityPols = (data || []).filter(policy => 
        policy.policy_type === 'RP' || policy.policy_type === 'S'
      );
      
      console.log('=== HR POLICIES ===', hrPols.length);
      console.log('=== FACILITY POLICIES ===', facilityPols.length);
      
      setHrPolicies(hrPols);
      setFacilityPolicies(facilityPols);
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
    hrPolicies,
    facilityPolicies,
    isLoadingPolicies,
  };
};
