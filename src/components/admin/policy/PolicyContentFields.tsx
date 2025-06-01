
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Control, UseFormSetValue } from 'react-hook-form';
import { PolicyFormValues } from './PolicyFormSchema';
import { processContentForDisplay } from '@/components/ui/rich-text-editor/contentUtils';

interface PolicyContentFieldsProps {
  control: Control<PolicyFormValues>;
  setValue: UseFormSetValue<PolicyFormValues>;
}

export function PolicyContentFields({ control, setValue }: PolicyContentFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="purpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purpose</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the purpose of this policy"
                className="min-h-[100px]"
                {...field}
                value={processContentForDisplay(field.value || '')}
                onChange={(e) => field.onChange(e.target.value)}
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
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
