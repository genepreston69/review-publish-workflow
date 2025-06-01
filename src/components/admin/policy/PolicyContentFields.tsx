
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

interface PolicyContentFieldsProps {
  control: Control<PolicyFormValues>;
  setValue: UseFormSetValue<PolicyFormValues>;
}

// Enhanced HTML stripping function
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Remove HTML tags completely
  let cleanText = html.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanText;
  cleanText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up multiple spaces and line breaks
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  return cleanText;
};

// Convert TipTap JSON to plain text
const extractTextFromJson = (jsonContent: any): string => {
  if (!jsonContent || typeof jsonContent !== 'object') return '';
  
  if (jsonContent.type === 'text') {
    return jsonContent.text || '';
  }
  
  if (jsonContent.content && Array.isArray(jsonContent.content)) {
    return jsonContent.content.map(extractTextFromJson).join(' ');
  }
  
  return '';
};

// Clean content function that handles both HTML and JSON
const cleanContent = (content: string): string => {
  if (!content) return '';
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === 'doc' && parsed.content) {
      return extractTextFromJson(parsed);
    }
  } catch {
    // Not JSON, continue
  }
  
  // Strip HTML if present
  if (content.includes('<') || content.includes('>') || content.includes('&')) {
    return stripHtmlTags(content);
  }
  
  return content;
};

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
                value={cleanContent(field.value || '')}
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
