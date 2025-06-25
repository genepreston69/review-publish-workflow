
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Control } from 'react-hook-form';
import { PolicyFormValues } from './PolicyFormSchema';

interface PolicyModeToggleProps {
  control: Control<PolicyFormValues>;
  onModeChange?: (isFreeForm: boolean) => void;
}

export function PolicyModeToggle({ control, onModeChange }: PolicyModeToggleProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-4">
        <FormField
          control={control}
          name="is_free_form"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-medium">
                  Policy Creation Mode
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  {field.value 
                    ? "Free-form mode: Use one large text box for the entire policy content"
                    : "Structured mode: Separate fields for purpose, policy content, and procedures"
                  }
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    onModeChange?.(checked);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
