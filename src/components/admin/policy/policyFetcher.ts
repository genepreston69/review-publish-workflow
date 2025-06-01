
import { supabase } from '@/integrations/supabase/client';
import { Policy } from './types';

export const fetchPoliciesByType = async (policyType: string): Promise<Policy[]> => {
  const { data, error } = await supabase
    .from('Policies')
    .select(`
      *,
      creator:creator_id(id, name, email),
      publisher:publisher_id(id, name, email)
    `)
    .eq('status', 'published')
    .eq('policy_type', policyType)
    .is('archived_at', null) // Only show non-archived policies
    .order('policy_number', { ascending: true });

  if (error) {
    console.error('Error fetching policies:', error);
    throw error;
  }

  return data || [];
};

export const fetchPoliciesByPrefix = async (prefix: string): Promise<Policy[]> => {
  const { data, error } = await supabase
    .from('Policies')
    .select(`
      *,
      creator:creator_id(id, name, email),
      publisher:publisher_id(id, name, email)
    `)
    .eq('status', 'published')
    .ilike('policy_number', `${prefix}%`)
    .is('archived_at', null) // Only show non-archived policies
    .order('policy_number', { ascending: true });

  if (error) {
    console.error('Error fetching policies:', error);
    throw error;
  }

  return data || [];
};

export const fetchAllPolicies = async (): Promise<Policy[]> => {
  const { data, error } = await supabase
    .from('Policies')
    .select(`
      *,
      creator:creator_id(id, name, email),
      publisher:publisher_id(id, name, email)
    `)
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
    .select(`
      *,
      creator:creator_id(id, name, email),
      publisher:publisher_id(id, name, email)
    `)
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
    .select(`
      *,
      creator:creator_id(id, name, email),
      publisher:publisher_id(id, name, email)
    `)
    .not('archived_at', 'is', null) // Only show archived policies
    .order('archived_at', { ascending: false });

  if (error) {
    console.error('Error fetching archived policies:', error);
    throw error;
  }

  return data || [];
};
