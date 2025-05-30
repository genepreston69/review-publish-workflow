
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formSchema, FormData } from './FormSchema';
import { FormFormFields } from './FormFormFields';
import { FormNumberDisplay } from './FormNumberDisplay';

interface FormEditFormProps {
  formId: string;
  onFormUpdated: (form: any) => void;
  onCancel: () => void;
}

export function FormEditForm({ formId, onFormUpdated, onCancel }: FormEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      form_type: '',
      purpose: '',
      reviewer: '',
      form_content: '',
      status: 'draft',
    },
  });

  const formContent = form.watch('form_content');

  // Fetch the form data
  const { data: formData, isLoading } = useQuery({
    queryKey: ['form', formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (formData) {
      form.reset({
        name: formData.name || '',
        form_type: formData.form_type || '',
        purpose: formData.purpose || '',
        reviewer: formData.reviewer || '',
        form_content: formData.form_content || '',
        status: formData.status || 'draft',
      });
    }
  }, [formData, form]);

  const updateFormMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const updateData = {
        name: data.name || null,
        form_type: data.form_type,
        purpose: data.purpose || null,
        reviewer: data.reviewer || null,
        form_content: data.form_content || null,
        status: data.status || 'draft',
      };

      const { data: updatedForm, error } = await supabase
        .from('Forms')
        .update(updateData)
        .eq('id', formId)
        .select()
        .single();

      if (error) throw error;
      return updatedForm;
    },
    onSuccess: (updatedForm) => {
      toast({
        title: 'Success',
        description: 'Form updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
      onFormUpdated(updatedForm);
    },
    onError: (error) => {
      console.error('Error updating form:', error);
      toast({
        title: 'Error',
        description: 'Failed to update form',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    updateFormMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!formData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Form not found.</p>
          <Button onClick={onCancel} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {formData.form_number && <FormNumberDisplay formNumber={formData.form_number} />}
              
              <FormFormFields form={form} />

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={updateFormMutation.isPending}
                >
                  {updateFormMutation.isPending ? 'Updating...' : 'Update Form'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                
                {formContent && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {showPreview && formContent && (
        <Card>
          <CardHeader>
            <CardTitle>Form Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="border rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: formContent }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
