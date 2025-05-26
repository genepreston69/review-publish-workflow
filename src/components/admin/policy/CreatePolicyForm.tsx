
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { Plus, Loader2 } from 'lucide-react';
import { PolicyFormFields } from './PolicyFormFields';
import { PolicyNumberDisplay } from './PolicyNumberDisplay';
import { usePolicyNumberGeneration } from './usePolicyNumberGeneration';
import { policyFormSchema, PolicyFormValues } from './PolicyFormSchema';

interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  policy_text: string | null;
  procedure: string | null;
  purpose: string | null;
  reviewer: string | null;
  status: string | null;
  created_at: string;
}

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
      // For edit users, create as draft and assign to a publisher
      // For publishers and super-admins, create as under review
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
        reviewer: currentUser.email,
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

      toast({
        title: "Success",
        description: `Policy created successfully with number ${generatedPolicyNumber}.`,
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

  if (!hasEditAccess) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Plus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Access Denied</h3>
            <p className="text-gray-500">You need edit access or higher to create policies.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Policy Form
        </CardTitle>
        <CardDescription>
          Fill out the form below to create a new facility policy. The policy number will be automatically generated based on the selected policy type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PolicyFormFields control={form.control} />
            
            <PolicyNumberDisplay policyNumber={generatedPolicyNumber} />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || !generatedPolicyNumber}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Policy
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
