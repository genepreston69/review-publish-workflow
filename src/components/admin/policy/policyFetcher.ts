import { supabase } from '@/integrations/supabase/client';
import { Policy } from './types';

export const fetchPoliciesByType = async (policyType: string): Promise<Policy[]> => {
  console.log('=== FETCHING POLICIES BY TYPE ===', policyType);
  
  let query = supabase
    .from('Policies')
    .select('*') // Remove the foreign key relationships that don't exist
    .eq('status', 'published')
    .is('archived_at', null); // Only show non-archived policies

  // Handle different policy type filtering logic
  if (policyType === 'Facility') {
    // For facility policies, include both 'Facility' type and legacy types that represent facility policies
    query = query.or('policy_type.eq.Facility,policy_type.eq.RP,policy_type.eq.S,policy_type.ilike.%facility%');
  } else if (policyType === 'HR') {
    // For HR policies, include 'HR' type and legacy HR-related types
    query = query.or('policy_type.eq.HR,policy_type.ilike.%hr%,policy_type.ilike.%human%');
  } else {
    // Default exact match for other types
    query = query.eq('policy_type', policyType);
  }

  query = query.order('policy_number', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching policies by type:', error);
    throw error;
  }

  console.log(`=== ${policyType.toUpperCase()} POLICIES FETCHED ===`, data?.length || 0);

  // Filter to show only the latest version of each policy family
  const latestVersions = filterLatestVersions(data || []);
  
  console.log(`=== LATEST VERSIONS FILTERED ===`, latestVersions.length);
  
  return latestVersions;
};

const filterLatestVersions = (policies: Policy[]): Policy[] => {
  // Group policies by their policy family (parent_policy_id or original id)
  const policyFamilies = new Map<string, Policy[]>();
  
  policies.forEach(policy => {
    const familyId = policy.parent_policy_id || policy.id;
    if (!policyFamilies.has(familyId)) {
      policyFamilies.set(familyId, []);
    }
    policyFamilies.get(familyId)!.push(policy);
  });
  
  // For each family, find the latest published version
  const latestVersions: Policy[] = [];
  
  policyFamilies.forEach(familyPolicies => {
    // Sort by created_at descending to get the latest first
    const sortedPolicies = familyPolicies.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Find the latest published version
    const latestPublished = sortedPolicies.find(p => p.status === 'published');
    
    if (latestPublished) {
      latestVersions.push(latestPublished);
    }
  });
  
  return latestVersions;
};

export const fetchPoliciesByPrefix = async (prefix: string): Promise<Policy[]> => {
  const { data, error } = await supabase
    .from('Policies')
    .select('*')
    .eq('status', 'published')
    .ilike('policy_number', `${prefix}%`)
    .is('archived_at', null) // Only show non-archived policies
    .order('policy_number', { ascending: true });

  if (error) {
    console.error('Error fetching policies:', error);
    throw error;
  }

  return filterLatestVersions(data || []);
};

export const fetchAllPolicies = async (): Promise<Policy[]> => {
  const { data, error } = await supabase
    .from('Policies')
    .select('*')
    .is('archived_at', null) // Only show non-archived policies
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all policies:', error);
    throw error;
  }

  return data || [];
};

export const fetchPoliciesByStatus = async (status: string): Promise<Policy[]> => {
  const { data, error } = await supabase
    .from('Policies')
    .select('*')
    .eq('status', status)
    .is('archived_at', null) // Only show non-archived policies
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching policies by status:', error);
    throw error;
  }

  return data || [];
};

export const fetchArchivedPolicies = async (): Promise<Policy[]> => {
  const { data, error } = await supabase
    .from('Policies')
    .select('*')
    .not('archived_at', 'is', null) // Only show archived policies
    .order('archived_at', { ascending: false });

  if (error) {
    console.error('Error fetching archived policies:', error);
    throw error;
  }

  return data || [];
};
