
import { useState, useEffect } from 'react';
import { fetchPoliciesByPrefix } from '@/components/admin/policy/policyFetcher';
import { useToast } from '@/hooks/use-toast';
import { Policy } from '@/components/admin/policy/types';

export const useAllUserPolicies = () => {
  const [hrPolicies, setHrPolicies] = useState<Policy[]>([]);
  const [facilityPolicies, setFacilityPolicies] = useState<Policy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const { toast } = useToast();

  const fetchAllPolicies = async () => {
    try {
      console.log('=== FETCHING ALL POLICIES FOR ALL USERS ===');
      setIsLoadingPolicies(true);
      
      // Fetch HR policies (policy numbers starting with "HR")
      const hrPoliciesData = await fetchPoliciesByPrefix('HR');
      console.log('=== HR POLICIES FETCHED ===', hrPoliciesData.length);
      
      // Fetch Facility policies (policy numbers starting with "RP")
      const facilityPoliciesData = await fetchPoliciesByPrefix('RP');
      console.log('=== FACILITY POLICIES FETCHED ===', facilityPoliciesData.length);
      
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
