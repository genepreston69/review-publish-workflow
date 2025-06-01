
import { CardContent } from '@/components/ui/card';
import { PolicyFormFields } from './PolicyFormFields';
import { PolicyFormValues } from './PolicyFormSchema';

interface PolicyEditFormContentProps {
  initialData: PolicyFormValues;
  onSubmit: (data: PolicyFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function PolicyEditFormContent({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  onCancel 
}: PolicyEditFormContentProps) {
  return (
    <CardContent>
      <PolicyFormFields 
        initialData={initialData}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
        submitLabel="Save Changes"
        onCancel={onCancel}
      />
    </CardContent>
  );
}
