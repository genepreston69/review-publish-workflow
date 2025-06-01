
import { CardContent } from '@/components/ui/card';
import { PolicyFormFields } from './PolicyFormFields';
import { PolicyFormValues } from './PolicyFormSchema';
import { UseFormReturn } from 'react-hook-form';

interface PolicyEditFormContentProps {
  initialData: PolicyFormValues;
  onSubmit: (data: PolicyFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  form: UseFormReturn<PolicyFormValues>;
}

export function PolicyEditFormContent({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  onCancel,
  form
}: PolicyEditFormContentProps) {
  return (
    <CardContent>
      <PolicyFormFields 
        initialData={initialData}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
        submitLabel="Save Changes"
        onCancel={onCancel}
        form={form}
      />
    </CardContent>
  );
}
