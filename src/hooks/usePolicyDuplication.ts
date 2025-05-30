
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const usePolicyDuplication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const duplicatePolicyForUpdate = async (policyId: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      
      // First, fetch the original policy
      const { data: originalPolicy, error: fetchError } = await supabase
        .from('Policies')
        .select('*')
        .eq('id', policyId)
        .single();

      if (fetchError) {
        console.error('Error fetching original policy:', fetchError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch original policy for duplication.",
        });
        return null;
      }

      // Create a new policy with the same content but as draft
      const duplicatedPolicy = {
        name: originalPolicy.name ? `${originalPolicy.name} - Updated` : null,
        policy_number: originalPolicy.policy_number,
        policy_text: originalPolicy.policy_text,
        procedure: originalPolicy.procedure,
        purpose: originalPolicy.purpose,
        reviewer: originalPolicy.reviewer,
        policy_type: originalPolicy.policy_type,
        status: 'draft'
      };

      const { data: newPolicy, error: insertError } = await supabase
        .from('Policies')
        .insert([duplicatedPolicy])
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating policy copy:', insertError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create policy copy for updating.",
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Policy copied to draft for updating. You can now edit the draft version.",
      });

      return newPolicy.id;
    } catch (error) {
      console.error('Error in duplicatePolicyForUpdate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while duplicating the policy.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    duplicatePolicyForUpdate,
    isLoading
  };
};
