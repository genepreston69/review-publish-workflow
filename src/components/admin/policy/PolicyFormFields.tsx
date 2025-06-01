
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { PolicyFormValues, policyFormSchema } from './PolicyFormSchema';
import { PolicyBasicFields } from './PolicyBasicFields';
import { PolicyContentFields } from './PolicyContentFields';
import { PolicyFormActions } from './PolicyFormActions';

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <PolicyBasicFields control={form.control} />
        <PolicyContentFields control={form.control} setValue={form.setValue} />
        <PolicyFormActions 
          isLoading={isLoading}
          submitLabel={submitLabel}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
