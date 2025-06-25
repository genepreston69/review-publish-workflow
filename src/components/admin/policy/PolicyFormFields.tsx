
import { PolicyFormValues } from './PolicyFormSchema';
import { PolicyBasicFields } from './PolicyBasicFields';
import { PolicyContentFields } from './PolicyContentFields';
import { PolicyModeToggle } from './PolicyModeToggle';
import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';

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
  const [hasConfirmedModeSwitch, setHasConfirmedModeSwitch] = useState(false);

  const handleModeChange = (isFreeForm: boolean) => {
    // Reset form validation errors when switching modes
    form.clearErrors();
    
    // Clear content from the mode we're switching away from
    if (isFreeForm) {
      // Switching to free-form: clear structured fields
      form.setValue('purpose', '');
      form.setValue('procedure', '');
    } else {
      // Switching to structured: clear free-form field
      form.setValue('free_form_content', '');
    }
    
    setHasConfirmedModeSwitch(true);
  };

  return (
    <div className="space-y-6">
      <PolicyBasicFields control={form.control} />
      
      <PolicyModeToggle 
        control={form.control} 
        onModeChange={handleModeChange}
      />
      
      <PolicyContentFields 
        control={form.control} 
        setValue={form.setValue}
        policyId={policyId}
        showChangeTracking={showChangeTracking}
        isNewPolicy={isNewPolicy}
      />
    </div>
  );
}
