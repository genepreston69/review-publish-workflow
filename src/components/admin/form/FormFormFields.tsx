
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormData } from './FormSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface FormFormFieldsProps {
  form: UseFormReturn<FormData>;
}

export function FormFormFields({ form }: FormFormFieldsProps) {
  const [showTailwindHelper, setShowTailwindHelper] = useState(false);

  const commonTailwindClasses = `
<!-- Common Tailwind Classes for Forms -->
<div class="space-y-4 p-6 bg-white rounded-lg border">
  <h2 class="text-2xl font-bold text-gray-900 mb-4">Form Title</h2>
  
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">Field Label</label>
    <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter text">
  </div>
  
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">Textarea</label>
    <textarea class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]" placeholder="Enter description"></textarea>
  </div>
  
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">Select</label>
    <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      <option>Option 1</option>
      <option>Option 2</option>
    </select>
  </div>
  
  <div class="flex space-x-4">
    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">Submit</button>
    <button type="reset" class="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors">Reset</button>
  </div>
</div>`;

  const insertTailwindTemplate = () => {
    const currentContent = form.getValues('form_content') || '';
    form.setValue('form_content', currentContent + commonTailwindClasses);
  };

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
            <FormLabel>Form Content (HTML with Tailwind CSS)</FormLabel>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTailwindHelper(!showTailwindHelper)}
                >
                  {showTailwindHelper ? 'Hide' : 'Show'} Tailwind Helper
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={insertTailwindTemplate}
                >
                  Insert Tailwind Template
                </Button>
              </div>
              
              {showTailwindHelper && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Common Tailwind Classes for Forms</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div><strong>Layout:</strong> space-y-4, p-6, bg-white, rounded-lg, border</div>
                    <div><strong>Typography:</strong> text-2xl, font-bold, text-gray-900, text-sm, font-medium</div>
                    <div><strong>Form Elements:</strong> w-full, px-3, py-2, border-gray-300, rounded-md</div>
                    <div><strong>Focus States:</strong> focus:outline-none, focus:ring-2, focus:ring-blue-500</div>
                    <div><strong>Buttons:</strong> bg-blue-600, hover:bg-blue-700, text-white, transition-colors</div>
                    <div><strong>Spacing:</strong> space-y-2, space-x-4, mb-4, min-h-[100px]</div>
                  </CardContent>
                </Card>
              )}
              
              <FormControl>
                <Textarea 
                  placeholder="Enter HTML content with Tailwind CSS classes for the form. Use classes like 'w-full px-3 py-2 border border-gray-300 rounded-md' for inputs."
                  className="min-h-[300px] font-mono text-sm"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
