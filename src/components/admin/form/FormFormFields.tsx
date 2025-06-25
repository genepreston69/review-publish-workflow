
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormData } from './FormSchema';

interface FormFormFieldsProps {
  form: UseFormReturn<FormData>;
}

export function FormFormFields({ form }: FormFormFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Form Name *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter form name" 
                {...field} 
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="form_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Form Type *</FormLabel>
            <FormControl>
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select form type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">Form (F)</SelectItem>
                  <SelectItem value="APP">Application (APP)</SelectItem>
                  <SelectItem value="REQ">Request (REQ)</SelectItem>
                  <SelectItem value="CHK">Checklist (CHK)</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="purpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purpose</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe the purpose of this form"
                className="min-h-[100px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="reviewer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reviewer</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter reviewer name"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="form_content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Form Content (HTML)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter HTML content for the form"
                className="min-h-[300px] font-mono text-sm"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
