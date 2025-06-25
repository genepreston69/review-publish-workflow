
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
import { PolicyFormHeader } from './PolicyFormHeader';
import { PolicyFormContent } from './PolicyFormContent';

interface PolicyCreationFormProps {
  userRole: string;
  hasEditAccess: boolean;
  onPolicyCreated: (policy: Policy) => void;
}

export function PolicyCreationForm({ userRole, hasEditAccess, onPolicyCreated }: PolicyCreationFormProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: '',
      policy_type: '',
      is_free_form: false,
      purpose: '',
      procedure: '',
      policy_text: '',
      free_form_content: '',
    },
  });

  // Watch policy type changes to generate policy number
  const selectedPolicyType = form.watch('policy_type');
  console.log('=== WATCHED POLICY TYPE ===', selectedPolicyType);
  
  const { generatedPolicyNumber, isLoading: isGeneratingNumber, error: numberGenerationError } = usePolicyNumberGeneration(selectedPolicyType);

  console.log('=== FORM STATE DEBUG ===');
  console.log('Selected policy type from form:', selectedPolicyType);
  console.log('Generated policy number:', generatedPolicyNumber);
  console.log('Is generating number:', isGeneratingNumber);
  console.log('Number generation error:', numberGenerationError);

  const onSubmit = async (data: PolicyFormValues) => {
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form data:', data);
    console.log('Current user:', currentUser);
    console.log('User role:', userRole);
    console.log('Generated policy number:', generatedPolicyNumber);
    console.log('Number generation error:', numberGenerationError);
    console.log('Is generating number:', isGeneratingNumber);

    if (!currentUser || !hasEditAccess) {
      console.log('=== ACCESS DENIED ===');
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to create policies.",
      });
      return;
    }

    if (numberGenerationError) {
      console.log('=== POLICY NUMBER GENERATION ERROR ===', numberGenerationError);
      toast({
        variant: "destructive",
        title: "Error",
        description: numberGenerationError,
      });
      return;
    }

    if (isGeneratingNumber) {
      console.log('=== STILL GENERATING POLICY NUMBER ===');
      toast({
        variant: "destructive",
        title: "Please Wait",
        description: "Policy number is still being generated. Please wait a moment and try again.",
      });
      return;
    }

    if (!generatedPolicyNumber) {
      console.log('=== NO POLICY NUMBER AVAILABLE ===');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Policy number could not be generated. Please select a policy type and try again.",
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
      
      // Handle data based on form mode
      let policyData;
      if (data.is_free_form && data.free_form_content) {
        // Free-form mode: store content in policy_text, leave others empty
        policyData = {
          name: data.name,
          policy_type: data.policy_type,
          purpose: 'Free-form policy - see policy content',
          procedure: 'See policy content for procedures',
          policy_text: data.free_form_content,
          policy_number: generatedPolicyNumber,
          status,
          creator_id: profileData.id,
          reviewer: currentUser.email, // Keep for backward compatibility
        };
      } else {
        // Structured mode: use separate fields
        policyData = {
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
      }
      
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

      const modeText = data.is_free_form ? 'free-form' : 'structured';
      const statusMessage = status === 'draft' 
        ? `${modeText} policy created as draft with number ${generatedPolicyNumber}.`
        : `${modeText} policy created and submitted for review with number ${generatedPolicyNumber}.`;

      toast({
        title: "Success",
        description: statusMessage,
      });

      // Call the callback with the created policy
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

  return (
    <Card>
      <PolicyFormHeader userRole={userRole} />
      <PolicyFormContent 
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        generatedPolicyNumber={generatedPolicyNumber}
        isGeneratingNumber={isGeneratingNumber}
        numberGenerationError={numberGenerationError}
        form={form}
        isNewPolicy={true}
      />
    </Card>
  );
}
