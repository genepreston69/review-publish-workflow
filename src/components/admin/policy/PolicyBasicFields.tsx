
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { PolicyFormValues } from './PolicyFormSchema';

interface PolicyBasicFieldsProps {
  control: Control<PolicyFormValues>;
}

export function PolicyBasicFields({ control }: PolicyBasicFieldsProps) {
  return (
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
                <SelectItem value="HR">HR Policy</SelectItem>
                <SelectItem value="RP">RP - Recovery Point Policy</SelectItem>
                <SelectItem value="S">S - Staff Policy</SelectItem>
                <SelectItem value="Admin">Admin - Administrative Policy</SelectItem>
                <SelectItem value="OTHER">Other Policy Type</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
