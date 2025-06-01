
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchPoliciesByType } from '@/components/admin/policy/policyFetcher';
import { useToast } from '@/hooks/use-toast';
import { Policy } from '@/components/admin/policy/types';

export const useAllUserPolicies = () => {
  const [hrPolicies, setHrPolicies] = useState<Policy[]>([]);
  const [facilityPolicies, setFacilityPolicies] = useState<Policy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const { toast } = useToast();

  const fetchAllPolicies = async () => {
    try {
      console.log('=== FETCHING ALL POLICIES FOR ALL USERS BY TYPE ===');
      setIsLoadingPolicies(true);
      
      // Fetch HR policies by policy_type field
      const hrPoliciesData = await fetchPoliciesByType('HR');
      console.log('=== HR POLICIES FETCHED BY TYPE ===', hrPoliciesData.length);
      
      // Fetch Facility policies by policy_type field
      const facilityPoliciesData = await fetchPoliciesByType('Facility');
      console.log('=== FACILITY POLICIES FETCHED BY TYPE ===', facilityPoliciesData.length);
      
      // Debug: Let's also check what policy types exist in the database
      if (facilityPoliciesData.length === 0) {
        console.log('=== DEBUG: No facility policies found, checking all policy types ===');
        // This will help us understand what policy_type values exist
        const { data: allPolicies } = await supabase
          .from('Policies')
          .select('policy_type')
          .eq('status', 'published')
          .is('archived_at', null);
        
        const uniqueTypes = [...new Set(allPolicies?.map(p => p.policy_type))];
        console.log('=== ALL UNIQUE POLICY TYPES IN DATABASE ===', uniqueTypes);
      }
      
      setHrPolicies(hrPoliciesData);
      setFacilityPolicies(facilityPoliciesData);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load policies.",
      });
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  useEffect(() => {
    fetchAllPolicies();
  }, []);

  return {
    hrPolicies,
    facilityPolicies,
    isLoadingPolicies,
    refetchPolicies: fetchAllPolicies,
  };
};
