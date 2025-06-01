import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import { PolicyFormFields } from './PolicyFormFields';
import { PolicyNumberDisplay } from './PolicyNumberDisplay';
import { policyFormSchema, PolicyFormValues } from './PolicyFormSchema';
import { Policy } from './types';

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

        // Populate form with existing data
        form.reset({
          name: data.name || '',
          policy_type: data.policy_type || '',
          purpose: data.purpose || '',
          procedure: data.procedure || '',
          policy_text: data.policy_text || '',
        });
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
  }, [policyId, form, toast, onCancel]);

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
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="mt-4 text-lg font-medium">Access Denied</h3>
            <p className="text-gray-500">You need edit access or higher to edit policies.</p>
            <Button onClick={onCancel} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Loading policy...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!policy) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="mt-4 text-lg font-medium">Policy Not Found</h3>
            <p className="text-gray-500">The requested policy could not be found.</p>
            <Button onClick={onCancel} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Edit Policy
            </CardTitle>
            <CardDescription>
              Update the policy information below. Changes will be saved with updated timestamp.
            </CardDescription>
            {policy.policy_number && (
              <PolicyNumberDisplay policyNumber={policy.policy_number} />
            )}
          </div>
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <PolicyFormFields 
          initialData={{
            name: policy.name || '',
            policy_type: policy.policy_type || '',
            purpose: policy.purpose || '',
            procedure: policy.procedure || '',
            policy_text: policy.policy_text || '',
          }}
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          submitLabel="Save Changes"
          onCancel={onCancel}
        />
      </CardContent>
    </Card>
  );
}
