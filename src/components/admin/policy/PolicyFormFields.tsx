
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PolicyFormValues, POLICY_TYPES } from './PolicyFormSchema';

interface PolicyFormFieldsProps {
  control: Control<PolicyFormValues>;
}

export function PolicyFormFields({ control }: PolicyFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter policy name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="policy_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {POLICY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
                placeholder="Describe the purpose of this policy..."
                className="min-h-[150px]"
                context="purpose"
                globalFixed={true}
              />
            </FormControl>
            <FormDescription>
              Explain why this policy exists and what it aims to achieve. Use the AI Assistant for professional policy language suggestions. Tracked changes are enabled to show your edits.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="policy_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Policy</FormLabel>
            <FormControl>
              <RichTextEditor 
                content={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter the complete policy text..."
                className="min-h-[250px]"
                context="policy text"
                globalFixed={true}
              />
            </FormControl>
            <FormDescription>
              The full text of the policy document with formatting. Use AI tools to convert to proper policy language and ensure professional tone. All changes are tracked with your initials.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="procedure"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Procedure</FormLabel>
            <FormControl>
              <RichTextEditor 
                content={field.value || ''}
                onChange={field.onChange}
                placeholder="Outline the step-by-step procedure..."
                className="min-h-[180px]"
                context="procedure"
                globalFixed={true}
              />
            </FormControl>
            <FormDescription>
              Provide detailed steps on how this policy should be implemented. The AI Assistant can help expand content and improve clarity. Your edits are tracked for review.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
