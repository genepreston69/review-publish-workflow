
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { AIWritingAssistant } from '@/components/ui/ai-writing-assistant';
import { PolicyFormValues, policyFormSchema } from './PolicyFormSchema';
import { useAuth } from '@/hooks/useAuth';

interface PolicyFormFieldsProps {
  initialData?: Partial<PolicyFormValues>;
  onSubmit: (data: PolicyFormValues) => void;
  isLoading: boolean;
  submitLabel: string;
  onCancel?: () => void;
}

export function PolicyFormFields({
  initialData,
  onSubmit,
  isLoading,
  submitLabel,
  onCancel,
}: PolicyFormFieldsProps) {
  const { currentUser } = useAuth();
  
  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: '',
      policy_type: '',
      purpose: '',
      policy_text: '',
      procedure: '',
      ...initialData,
    },
  });

  const handleSubmit = (data: PolicyFormValues) => {
    onSubmit(data);
  };

  // Helper function to update form field values from AI Assistant
  const updateFormField = (fieldName: keyof PolicyFormValues, newValue: string) => {
    form.setValue(fieldName, newValue, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                    <SelectItem value="HR">HR Policy</SelectItem>
                    <SelectItem value="Facility">Facility Policy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Purpose
                <AIWritingAssistant
                  text={field.value || ''}
                  onChange={(newValue) => updateFormField('purpose', newValue)}
                  context="Policy purpose section"
                  className="ml-2"
                />
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the purpose of this policy"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="policy_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Policy Content
                <AIWritingAssistant
                  text={field.value || ''}
                  onChange={(newValue) => updateFormField('policy_text', newValue)}
                  context="Main policy content"
                  className="ml-2"
                />
              </FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Enter the main policy content..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="procedure"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Procedures
                <AIWritingAssistant
                  text={field.value || ''}
                  onChange={(newValue) => updateFormField('procedure', newValue)}
                  context="Policy procedures and implementation steps"
                  className="ml-2"
                />
              </FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Enter the procedures and implementation steps..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
