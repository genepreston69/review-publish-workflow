
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PolicyFormValues, policyFormSchema } from './PolicyFormSchema';
import { Policy } from './types';

interface PolicyEditFormLogicProps {
  policyId: string;
  onPolicyUpdated: (policy: Policy) => void;
  onCancel: () => void;
}

export function usePolicyEditFormLogic({ policyId, onPolicyUpdated, onCancel }: PolicyEditFormLogicProps) {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState<Policy | null>(null);

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: '',
      policy_type: '',
      purpose: '',
      procedure: '',
      policy_text: '',
    },
  });

  // Check if user has edit access
  const hasEditAccess = userRole === 'edit' || userRole === 'publish' || userRole === 'super-admin';

  // Load existing policy data
  useEffect(() => {
    const loadPolicy = async () => {
      try {
        setIsLoading(true);
        console.log('=== LOADING POLICY FOR EDIT ===', policyId);

        // First get the policy
        const { data: policyData, error: policyError } = await supabase
          .from('Policies')
          .select('*')
          .eq('id', policyId)
          .single();

        if (policyError) {
          console.error('Error loading policy:', policyError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load policy for editing.",
          });
          onCancel();
          return;
        }

        // Then get creator and publisher separately if they exist
        let creator = null;
        let publisher = null;

        if (policyData.creator_id) {
          const { data: creatorData } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', policyData.creator_id)
            .single();
          creator = creatorData;
        }

        if (policyData.publisher_id) {
          const { data: publisherData } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', policyData.publisher_id)
            .single();
          publisher = publisherData;
        }

        console.log('=== POLICY LOADED FOR EDIT ===', policyData);
        
        // Create Policy object with proper typing
        const typedPolicy: Policy = {
          ...policyData,
          creator,
          publisher,
        };
        
        setPolicy(typedPolicy);

        // Reset form with policy data
        const initialData: PolicyFormValues = {
          name: typedPolicy.name || '',
          policy_type: typedPolicy.policy_type || '',
          purpose: typedPolicy.purpose || '',
          procedure: typedPolicy.procedure || '',
          policy_text: typedPolicy.policy_text || '',
        };
        form.reset(initialData);
      } catch (error) {
        console.error('Error loading policy:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load policy for editing.",
        });
        onCancel();
      } finally {
        setIsLoading(false);
      }
    };

    if (policyId) {
      loadPolicy();
    }
  }, [policyId, toast, onCancel, form]);

  const onSubmit = async (data: PolicyFormValues) => {
    console.log('=== UPDATING POLICY ===');
    console.log('Form data:', data);
    console.log('Policy ID:', policyId);

    if (!currentUser || !hasEditAccess || !policy) {
      console.log('=== ACCESS DENIED OR NO POLICY ===');
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to edit policies.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('=== UPDATING POLICY IN DATABASE ===');
      const updateData = {
        name: data.name,
        policy_type: data.policy_type,
        purpose: data.purpose,
        procedure: data.procedure,
        policy_text: data.policy_text,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedData, error } = await supabase
        .from('Policies')
        .update(updateData)
        .eq('id', policyId)
        .select('*')
        .single();

      if (error) {
        console.error('=== SUPABASE UPDATE ERROR ===', error);
        throw error;
      }

      console.log('=== POLICY UPDATED SUCCESSFULLY ===', updatedData);

      toast({
        title: "Success",
        description: "Policy updated successfully.",
      });

      // Create updated policy with existing creator/publisher
      const updatedPolicy: Policy = {
        ...updatedData,
        creator: policy.creator,
        publisher: policy.publisher,
      };
      
      onPolicyUpdated(updatedPolicy);
    } catch (error) {
      console.error('=== ERROR UPDATING POLICY ===', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update policy. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    policy,
    isLoading,
    isSubmitting,
    hasEditAccess,
    onSubmit,
  };
}
