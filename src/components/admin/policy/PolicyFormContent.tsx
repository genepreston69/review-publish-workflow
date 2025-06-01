
import { CardContent } from '@/components/ui/card';
import { PolicyFormFields } from './PolicyFormFields';
import { PolicyNumberDisplay } from './PolicyNumberDisplay';

interface PolicyFormContentProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  generatedPolicyNumber: string;
}

export function PolicyFormContent({ 
  onSubmit, 
  isSubmitting, 
  generatedPolicyNumber 
}: PolicyFormContentProps) {
  return (
    <CardContent>
      <PolicyFormFields 
        onSubmit={onSubmit}
        isLoading={isSubmitting}
        submitLabel="Create Policy"
      />
      
      <PolicyNumberDisplay policyNumber={generatedPolicyNumber} />
    </CardContent>
  );
}
