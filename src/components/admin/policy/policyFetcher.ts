
import { supabase } from '@/integrations/supabase/client';
import { Policy } from './types';

export const fetchPoliciesByPrefix = async (prefix: string): Promise<Policy[]> => {
  console.log('=== FETCHING POLICIES ===');
  console.log('Prefix:', prefix);
  
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

  console.log('Policies fetched from database:', data?.length || 0);
  console.log('Policy numbers found:', data?.map(p => p.policy_number) || []);
  console.log('=== FETCH COMPLETE ===');

  return data || [];
};
