
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, FileText } from 'lucide-react';

const policyFormSchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  policy_type: z.string().min(1, 'Policy type is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  procedure: z.string().min(1, 'Procedure is required'),
  policy_text: z.string().min(1, 'Policy text is required'),
});

type PolicyFormValues = z.infer<typeof policyFormSchema>;

const POLICY_TYPES = [
  { value: 'RP', label: 'RP - Recovery Point Policy' },
  { value: 'HR', label: 'HR - Human Resources Policy' },
  { value: 'S', label: 'S - Staff Policy' },
  { value: 'OTHER', label: 'Other Policy Type' },
];

export function CreatePolicy() {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPolicyNumber, setGeneratedPolicyNumber] = useState<string>('');

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

  useEffect(() => {
    const generatePolicyNumber = async () => {
      if (!selectedPolicyType) {
        setGeneratedPolicyNumber('');
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('generate_next_policy_number', { p_policy_type: selectedPolicyType });

        if (error) {
          console.error('Error generating policy number:', error);
          setGeneratedPolicyNumber('');
        } else {
          setGeneratedPolicyNumber(data);
        }
      } catch (error) {
        console.error('Error generating policy number:', error);
        setGeneratedPolicyNumber('');
      }
    };

    generatePolicyNumber();
  }, [selectedPolicyType]);

  const onSubmit = async (data: PolicyFormValues) => {
    if (!currentUser || !hasEditAccess) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to create policies.",
      });
      return;
    }

    if (!generatedPolicyNumber) {
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

      const { error } = await supabase
        .from('Policies')
        .insert({
          name: data.name,
          policy_type: data.policy_type,
          purpose: data.purpose,
          procedure: data.procedure,
          policy_text: data.policy_text,
          policy_number: generatedPolicyNumber,
          status,
          reviewer: currentUser.email,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Policy created successfully with number ${generatedPolicyNumber}.`,
      });

      form.reset();
      setGeneratedPolicyNumber('');
    } catch (error) {
      console.error('Error creating policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create policy. Please try again.",
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Policy</h2>
        <p className="text-muted-foreground">
          Create a new facility policy with automatic numbering. {userRole === 'edit' ? 'Your policy will be saved as a draft and assigned to a publisher for review.' : 'Your policy will be created for review.'}
        </p>
      </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter policy name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="policy_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select policy type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {POLICY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {generatedPolicyNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Generated Policy Number</p>
                      <p className="text-blue-700 font-mono text-lg">{generatedPolicyNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <RichTextEditor 
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="Describe the purpose of this policy..."
                        className="min-h-[150px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Explain why this policy exists and what it aims to achieve.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="procedure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procedure</FormLabel>
                    <FormControl>
                      <RichTextEditor 
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="Outline the step-by-step procedure..."
                        className="min-h-[180px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Provide detailed steps on how this policy should be implemented.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="policy_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Text</FormLabel>
                    <FormControl>
                      <RichTextEditor 
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="Enter the complete policy text..."
                        className="min-h-[250px]"
                      />
                    </FormControl>
                    <FormDescription>
                      The full text of the policy document with formatting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
    </div>
  );
}
