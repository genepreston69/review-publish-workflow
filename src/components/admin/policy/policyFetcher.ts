import { supabase } from '@/integrations/supabase/client';
import { Policy } from './types';

export const fetchPoliciesByType = async (policyType: string): Promise<Policy[]> => {
  const { data, error } = await supabase
    .from('Policies')
    .select('*')
    .eq('status', 'published')
    .eq('policy_type', policyType)
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
    .select('*')
    .eq('status', 'published')
    .ilike('policy_number', `${prefix}%`)
    .order('policy_number', { ascending: true });

  if (error) {
    console.error('Error fetching policies:', error);
    throw error;
  }

  return data || [];
};
