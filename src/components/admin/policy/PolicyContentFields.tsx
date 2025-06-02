
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Control, UseFormSetValue } from 'react-hook-form';
import { PolicyFormValues } from './PolicyFormSchema';

interface PolicyContentFieldsProps {
  control: Control<PolicyFormValues>;
  setValue: UseFormSetValue<PolicyFormValues>;
  policyId?: string;
  showChangeTracking?: boolean;
}

export function PolicyContentFields({ 
  control, 
  setValue, 
  policyId, 
  showChangeTracking = false 
}: PolicyContentFieldsProps) {
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
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
