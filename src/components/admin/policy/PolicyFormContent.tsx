
import { CardContent } from '@/components/ui/card';
import { PolicyFormFields } from './PolicyFormFields';
import { PolicyNumberDisplay } from './PolicyNumberDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PolicyFormContentProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  generatedPolicyNumber: string;
  isGeneratingNumber?: boolean;
  numberGenerationError?: string | null;
}

export function PolicyFormContent({ 
  onSubmit, 
  isSubmitting, 
  generatedPolicyNumber,
  isGeneratingNumber = false,
  numberGenerationError = null
}: PolicyFormContentProps) {
  return (
    <CardContent>
      <PolicyFormFields 
        onSubmit={onSubmit}
        isLoading={isSubmitting}
        submitLabel="Create Policy"
      />
      
      {/* Policy number generation status */}
      {isGeneratingNumber && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-900">Generating policy number...</span>
          </div>
        </div>
      )}
      
      {numberGenerationError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {numberGenerationError}
          </AlertDescription>
        </Alert>
      )}
      
      <PolicyNumberDisplay policyNumber={generatedPolicyNumber} />
    </CardContent>
  );
}
