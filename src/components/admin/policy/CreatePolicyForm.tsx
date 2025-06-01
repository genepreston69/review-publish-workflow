
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePolicyNumberGeneration } from './usePolicyNumberGeneration';
import { policyFormSchema, PolicyFormValues } from './PolicyFormSchema';
import { Policy } from './types';
import { PolicyFormValidation } from './PolicyFormValidation';
import { PolicyFormHeader } from './PolicyFormHeader';
import { PolicyFormContent } from './PolicyFormContent';

interface CreatePolicyFormProps {
  onPolicyCreated: (policy: Policy) => void;
}

export function CreatePolicyForm({ onPolicyCreated }: CreatePolicyFormProps) {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Watch policy type changes to generate policy number
  const selectedPolicyType = form.watch('policy_type');
  const generatedPolicyNumber = usePolicyNumberGeneration(selectedPolicyType);

  const onSubmit = async (data: PolicyFormValues) => {
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form data:', data);
    console.log('Current user:', currentUser);
    console.log('User role:', userRole);
    console.log('Generated policy number:', generatedPolicyNumber);

    if (!currentUser || !hasEditAccess) {
      console.log('=== ACCESS DENIED ===');
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to create policies.",
      });
      return;
    }

    if (!generatedPolicyNumber) {
      console.log('=== NO POLICY NUMBER ===');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Policy number could not be generated. Please try again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get creator profile to store creator_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('=== ERROR FETCHING PROFILE ===', profileError);
        throw new Error('Could not fetch user profile');
      }

      // Set status based on user role:
      // - edit users: create as draft
      // - publish/super-admin users: create as under-review
      const status = userRole === 'edit' ? 'draft' : 'under-review';

      console.log('=== INSERTING POLICY ===');
      const policyData = {
        name: data.name,
        policy_type: data.policy_type,
        purpose: data.purpose,
        procedure: data.procedure,
        policy_text: data.policy_text,
        policy_number: generatedPolicyNumber,
        status,
        creator_id: profileData.id,
        reviewer: currentUser.email, // Keep for backward compatibility
      };
      console.log('Policy data to insert:', policyData);

      const { data: insertedData, error } = await supabase
        .from('Policies')
        .insert(policyData)
        .select();

      if (error) {
        console.error('=== SUPABASE ERROR ===', error);
        throw error;
      }

      console.log('=== POLICY CREATED SUCCESSFULLY ===', insertedData);

      const statusMessage = status === 'draft' 
        ? `Policy created as draft with number ${generatedPolicyNumber}.`
        : `Policy created and submitted for review with number ${generatedPolicyNumber}.`;

      toast({
        title: "Success",
        description: statusMessage,
      });

      // Reset the form and notify parent
      form.reset();
      if (insertedData && insertedData[0]) {
        onPolicyCreated(insertedData[0]);
      }
    } catch (error) {
      console.error('=== ERROR CREATING POLICY ===', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create policy. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show access denied component if user doesn't have permission
  if (!hasEditAccess) {
    return <PolicyFormValidation hasEditAccess={hasEditAccess} />;
  }

  return (
    <Card>
      <PolicyFormHeader userRole={userRole} />
      <PolicyFormContent 
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        generatedPolicyNumber={generatedPolicyNumber}
      />
    </Card>
  );
}
