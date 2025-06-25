
import { Form } from '@/components/ui/form';
import { PolicyFormValues } from './PolicyFormSchema';
import { PolicyBasicFields } from './PolicyBasicFields';
import { PolicyContentFields } from './PolicyContentFields';
import { UseFormReturn } from 'react-hook-form';

interface PolicyFormFieldsProps {
  onSubmit: (data: PolicyFormValues) => void;
  isLoading: boolean;
  submitLabel: string;
  onCancel?: () => void;
  form: UseFormReturn<PolicyFormValues>;
  policyId?: string;
  showChangeTracking?: boolean;
  isNewPolicy?: boolean;
}

export function PolicyFormFields({
  form,
  policyId,
  showChangeTracking = false,
  isNewPolicy = false,
}: PolicyFormFieldsProps) {
  return (
    <>
      <PolicyBasicFields control={form.control} />
      <PolicyContentFields 
        control={form.control} 
        setValue={form.setValue}
        policyId={policyId}
        showChangeTracking={showChangeTracking}
        isNewPolicy={isNewPolicy}
      />
    </>
  );
}
