import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { Plus, Loader2, FileText, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { PolicyFormFields } from './policy/PolicyFormFields';
import { PolicyNumberDisplay } from './policy/PolicyNumberDisplay';
import { usePolicyNumberGeneration } from './policy/usePolicyNumberGeneration';
import { policyFormSchema, PolicyFormValues } from './policy/PolicyFormSchema';

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

// Function to strip HTML tags from text
const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export function CreatePolicy() {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);

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
  const canPublish = userRole === 'publish' || userRole === 'super-admin';
  const isEditor = userRole === 'edit';

  // Watch policy type changes to generate policy number
  const selectedPolicyType = form.watch('policy_type');
  const generatedPolicyNumber = usePolicyNumberGeneration(selectedPolicyType);

  // Fetch policies based on user role
  useEffect(() => {
    async function fetchPolicies() {
      if (!currentUser || !userRole) return;
      
      try {
        setIsLoadingPolicies(true);
        console.log('=== FETCHING POLICIES FOR CREATE PAGE ===', userRole);
        
        let query = supabase.from('Policies').select('*');
        
        if (isEditor) {
          // Editors see their own draft policies
          query = query.eq('reviewer', currentUser.email).eq('status', 'draft');
        } else if (canPublish) {
          // Publishers see policies under review
          query = query.in('status', ['under-review', 'under review', 'draft']);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching policies:', error);
        } else {
          console.log('=== POLICIES FOR CREATE PAGE ===', data);
          setPolicies(data || []);
        }
      } catch (error) {
        console.error('Error fetching policies:', error);
      } finally {
        setIsLoadingPolicies(false);
      }
    }

    fetchPolicies();
  }, [currentUser, userRole, isEditor, canPublish]);

  const updatePolicyStatus = async (policyId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('Policies')
        .update({ status: newStatus })
        .eq('id', policyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Policy ${newStatus === 'active' ? 'published' : 'rejected'} successfully.`,
      });

      // Refresh policies
      setPolicies(prev => prev.filter(p => p.id !== policyId));
    } catch (error) {
      console.error('Error updating policy status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update policy status.",
      });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'under-review':
      case 'under review':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

      // Reset the form and refresh policies
      form.reset();
      if (insertedData && insertedData[0]) {
        setPolicies(prev => [insertedData[0], ...prev]);
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

  // Check form validation state
  const formErrors = form.formState.errors;
  const isFormValid = Object.keys(formErrors).length === 0;
  console.log('=== FORM STATE ===', {
    errors: formErrors,
    isValid: isFormValid,
    isDirty: form.formState.isDirty,
    isSubmitting,
    generatedPolicyNumber
  });

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

      {/* Policy Cards Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            {isEditor && "Your Draft Policies"}
            {canPublish && !isEditor && "Policies Awaiting Review"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isEditor && "Manage your draft policies before they are sent for review"}
            {canPublish && !isEditor && "Review and approve policies for publication"}
          </p>
        </div>

        {isLoadingPolicies ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : policies.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="mx-auto h-8 w-8 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium">
                  {isEditor && "No draft policies"}
                  {canPublish && !isEditor && "No policies to review"}
                </h4>
                <p className="text-xs text-gray-500">
                  {isEditor && "Your draft policies will appear here"}
                  {canPublish && !isEditor && "Policies awaiting review will appear here"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {policy.name || 'Untitled Policy'}
                      </CardTitle>
                      {policy.policy_number && (
                        <CardDescription className="font-mono text-xs">
                          {policy.policy_number}
                        </CardDescription>
                      )}
                    </div>
                    {policy.status && (
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(policy.status)}
                      >
                        {policy.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {policy.purpose && (
                      <div>
                        <h4 className="font-medium text-xs text-gray-700">Purpose</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {stripHtml(policy.purpose)}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      {policy.reviewer && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-20">{stripHtml(policy.reviewer)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(policy.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Publisher Actions */}
                    {canPublish && (policy.status === 'draft' || policy.status === 'under-review' || policy.status === 'under review') && (
                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          size="sm"
                          onClick={() => updatePolicyStatus(policy.id, 'active')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePolicyStatus(policy.id, 'archived')}
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-xs"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
