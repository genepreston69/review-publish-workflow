
import { Form } from '@/components/ui/form';
import { PolicyFormValues } from './PolicyFormSchema';
import { PolicyBasicFields } from './PolicyBasicFields';
import { PolicyContentFields } from './PolicyContentFields';
import { PolicyFormActions } from './PolicyFormActions';
import { UseFormReturn } from 'react-hook-form';

interface PolicyFormFieldsProps {
  initialData?: Partial<PolicyFormValues>;
  onSubmit: (data: PolicyFormValues) => void;
  isLoading: boolean;
  submitLabel: string;
  onCancel?: () => void;
  form: UseFormReturn<PolicyFormValues>;
}

export function PolicyFormFields({
  onSubmit,
  isLoading,
  submitLabel,
  onCancel,
  form,
}: PolicyFormFieldsProps) {
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
