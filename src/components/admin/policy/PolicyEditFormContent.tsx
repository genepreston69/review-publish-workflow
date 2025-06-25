
import { FormProvider } from 'react-hook-form';
import { CardContent } from '@/components/ui/card';
import { PolicyFormFields } from './PolicyFormFields';
import { PolicyFormActions } from './PolicyFormActions';
import { PolicyFormValues } from './PolicyFormSchema';
import { UseFormReturn } from 'react-hook-form';
import { DiffEditor } from './DiffEditor';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GitCompare } from 'lucide-react';

interface PolicyEditFormContentProps {
  initialData: PolicyFormValues;
  onSubmit: (data: PolicyFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  form: UseFormReturn<PolicyFormValues>;
  policyId: string;
  showChangeTracking?: boolean;
}

export function PolicyEditFormContent({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
  form,
  policyId,
  showChangeTracking = false,
}: PolicyEditFormContentProps) {
  const [showDiffView, setShowDiffView] = useState(false);
  const currentValues = form.watch();

  const hasChanges = JSON.stringify(initialData) !== JSON.stringify(currentValues);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardContent className="space-y-6">
          {showChangeTracking && (
            <div className="flex justify-between items-center border-b pb-4">
              <div className="text-sm text-gray-600">
                {hasChanges ? 'You have unsaved changes' : 'No changes detected'}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDiffView(!showDiffView)}
                className="flex items-center gap-2"
              >
                <GitCompare className="h-4 w-4" />
                {showDiffView ? 'Hide Changes' : 'Show Changes'}
              </Button>
            </div>
          )}

          {showChangeTracking && showDiffView && hasChanges && (
            <div className="space-y-4">
              {/* Show diff for each changed field */}
              {initialData.purpose !== currentValues.purpose && (
                <DiffEditor
                  policyId={policyId}
                  fieldName="purpose"
                  originalContent={initialData.purpose || ''}
                  currentContent={currentValues.purpose || ''}
                />
              )}
              {initialData.policy_text !== currentValues.policy_text && (
                <DiffEditor
                  policyId={policyId}
                  fieldName="policy_text"
                  originalContent={initialData.policy_text || ''}
                  currentContent={currentValues.policy_text || ''}
                />
              )}
              {initialData.procedure !== currentValues.procedure && (
                <DiffEditor
                  policyId={policyId}
                  fieldName="procedure"
                  originalContent={initialData.procedure || ''}
                  currentContent={currentValues.procedure || ''}
                />
              )}
            </div>
          )}

          <PolicyFormFields />
          
          <PolicyFormActions
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            submitText="Update Policy"
          />
        </CardContent>
      </form>
    </FormProvider>
  );
}
