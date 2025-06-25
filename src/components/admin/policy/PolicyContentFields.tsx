
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { PolicyFormValues } from './PolicyFormSchema';

interface PolicyContentFieldsProps {
  control: Control<PolicyFormValues>;
  setValue: UseFormSetValue<PolicyFormValues>;
  policyId?: string;
  showChangeTracking?: boolean;
  isNewPolicy?: boolean;
}

export function PolicyContentFields({ 
  control, 
  setValue, 
  policyId, 
  showChangeTracking = false,
  isNewPolicy = false
}: PolicyContentFieldsProps) {
  const isFreeForm = useWatch({
    control,
    name: 'is_free_form',
    defaultValue: false,
  });

  if (isFreeForm) {
    return (
      <FormField
        control={control}
        name="free_form_content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Policy Content</FormLabel>
            <FormControl>
              <RichTextEditor
                content={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter your complete policy content here. Include purpose, policy details, and procedures all in one comprehensive document..."
                policyId={policyId}
                fieldName="free_form_content"
                showChangeTracking={showChangeTracking}
                isNewPolicy={isNewPolicy}
                className="min-h-[400px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <>
      <FormField
        control={control}
        name="purpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purpose</FormLabel>
            <FormControl>
              <RichTextEditor
                content={field.value || ''}
                onChange={field.onChange}
                placeholder="Describe the purpose of this policy"
                policyId={policyId}
                fieldName="purpose"
                showChangeTracking={showChangeTracking}
                isNewPolicy={isNewPolicy}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="policy_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Policy Content</FormLabel>
            <FormControl>
              <RichTextEditor
                content={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter the main policy content..."
                policyId={policyId}
                fieldName="policy_text"
                showChangeTracking={showChangeTracking}
                isNewPolicy={isNewPolicy}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="procedure"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Procedures</FormLabel>
            <FormControl>
              <RichTextEditor
                content={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter the procedures and implementation steps..."
                policyId={policyId}
                fieldName="procedure"
                showChangeTracking={showChangeTracking}
                isNewPolicy={isNewPolicy}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
