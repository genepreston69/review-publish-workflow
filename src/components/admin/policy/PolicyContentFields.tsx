
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { AIWritingAssistant } from '@/components/ui/ai-writing-assistant';
import { Control, UseFormSetValue } from 'react-hook-form';
import { PolicyFormValues } from './PolicyFormSchema';
import { extractPlainText, convertTextToHtml } from './PolicyFormHelpers';

interface PolicyContentFieldsProps {
  control: Control<PolicyFormValues>;
  setValue: UseFormSetValue<PolicyFormValues>;
}

export function PolicyContentFields({ control, setValue }: PolicyContentFieldsProps) {
  // Helper function to update form field values from AI Assistant
  const updateFormField = (fieldName: keyof PolicyFormValues, newValue: string) => {
    // Convert the plain text response to HTML format for rich text fields
    const htmlValue = fieldName === 'policy_text' || fieldName === 'procedure' || fieldName === 'purpose' 
      ? convertTextToHtml(newValue)
      : newValue;
    
    setValue(fieldName, htmlValue, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
      <FormField
        control={control}
        name="purpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              Purpose
              <AIWritingAssistant
                text={extractPlainText(field.value || '')}
                onChange={(newValue) => updateFormField('purpose', newValue)}
                context="Policy purpose section"
                className="ml-2"
              />
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the purpose of this policy"
                className="min-h-[100px]"
                {...field}
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
            <FormLabel className="flex items-center justify-between">
              Policy Content
              <AIWritingAssistant
                text={extractPlainText(field.value || '')}
                onChange={(newValue) => updateFormField('policy_text', newValue)}
                context="Main policy content"
                className="ml-2"
              />
            </FormLabel>
            <FormControl>
              <RichTextEditor
                content={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter the main policy content..."
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
            <FormLabel className="flex items-center justify-between">
              Procedures
              <AIWritingAssistant
                text={extractPlainText(field.value || '')}
                onChange={(newValue) => updateFormField('procedure', newValue)}
                context="Policy procedures and implementation steps"
                className="ml-2"
              />
            </FormLabel>
            <FormControl>
              <RichTextEditor
                content={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter the procedures and implementation steps..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
