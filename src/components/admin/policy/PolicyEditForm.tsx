import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PolicyFormValues, policyFormSchema } from './PolicyFormSchema';
import { Policy } from './types';
import { PolicyEditFormHeader } from './PolicyEditFormHeader';
import { PolicyEditFormContent } from './PolicyEditFormContent';
import { PolicyEditFormLoading } from './PolicyEditFormLoading';
import { PolicyEditFormNotFound } from './PolicyEditFormNotFound';
import { PolicyEditFormAccessDenied } from './PolicyEditFormAccessDenied';

interface PolicyEditFormProps {
  policyId: string;
  onPolicyUpdated: (policy: Policy) => void;
  onCancel: () => void;
}

export function PolicyEditForm({ policyId, onPolicyUpdated, onCancel }: PolicyEditFormProps) {
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

        const { data, error } = await supabase
          .from('Policies')
          .select(`
            *,
            creator:creator_id(id, name, email),
            publisher:publisher_id(id, name, email)
          `)
          .eq('id', policyId)
          .single();

        if (error) {
          console.error('Error loading policy:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load policy for editing.",
          });
          onCancel();
          return;
        }

        console.log('=== POLICY LOADED FOR EDIT ===', data);
        setPolicy(data);

        // Reset form with policy data
        const initialData: PolicyFormValues = {
          name: data.name || '',
          policy_type: data.policy_type || '',
          purpose: data.purpose || '',
          procedure: data.procedure || '',
          policy_text: data.policy_text || '',
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
        // Keep existing policy_number and other fields
      };

      const { data: updatedData, error } = await supabase
        .from('Policies')
        .update(updateData)
        .eq('id', policyId)
        .select(`
          *,
          creator:creator_id(id, name, email),
          publisher:publisher_id(id, name, email)
        `);

      if (error) {
        console.error('=== SUPABASE UPDATE ERROR ===', error);
        throw error;
      }

      console.log('=== POLICY UPDATED SUCCESSFULLY ===', updatedData);

      toast({
        title: "Success",
        description: "Policy updated successfully.",
      });

      // Notify parent component
      if (updatedData && updatedData[0]) {
        onPolicyUpdated(updatedData[0]);
      }
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

  if (!hasEditAccess) {
    return <PolicyEditFormAccessDenied onCancel={onCancel} />;
  }

  if (isLoading) {
    return <PolicyEditFormLoading />;
  }

  if (!policy) {
    return <PolicyEditFormNotFound onCancel={onCancel} />;
  }

  const initialData: PolicyFormValues = {
    name: policy.name || '',
    policy_type: policy.policy_type || '',
    purpose: policy.purpose || '',
    procedure: policy.procedure || '',
    policy_text: policy.policy_text || '',
  };

  return (
    <Card>
      <PolicyEditFormHeader 
        policyNumber={policy.policy_number} 
        onCancel={onCancel} 
      />
      <PolicyEditFormContent 
        initialData={initialData}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        form={form}
        policyId={policyId}
        showChangeTracking={true}
      />
    </Card>
  );
}
