
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formSchema, FormData } from './FormSchema';
import { FormFormFields } from './FormFormFields';
import { FormNumberDisplay } from './FormNumberDisplay';
import { useFormNumberGeneration } from './useFormNumberGeneration';

interface CreateFormFormProps {
  onFormCreated?: () => void;
}

export function CreateFormForm({ onFormCreated }: CreateFormFormProps) {
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

  const formType = form.watch('form_type');
  const formContent = form.watch('form_content');
  const { data: formNumber } = useFormNumberGeneration(formType);

  const createFormMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase
        .from('Forms')
        .insert({
          ...data,
          form_number: formNumber,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Form created successfully',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      onFormCreated?.();
    },
    onError: (error) => {
      console.error('Error creating form:', error);
      toast({
        title: 'Error',
        description: 'Failed to create form',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createFormMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {formNumber && <FormNumberDisplay formNumber={formNumber} />}
              
              <FormFormFields form={form} />

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={createFormMutation.isPending}
                >
                  {createFormMutation.isPending ? 'Creating...' : 'Create Form'}
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
