
import { z } from 'zod';

export const policyFormSchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  policy_type: z.string().min(1, 'Policy type is required'),
  is_free_form: z.boolean().default(false),
  purpose: z.string().optional(),
  procedure: z.string().optional(),
  policy_text: z.string().min(1, 'Policy content is required'),
  free_form_content: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.is_free_form) {
    // In free-form mode, only free_form_content is required
    if (!data.free_form_content || data.free_form_content.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Free-form content is required',
        path: ['free_form_content'],
      });
    }
  } else {
    // In structured mode, purpose and procedure are required
    if (!data.purpose || data.purpose.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Purpose is required',
        path: ['purpose'],
      });
    }
    if (!data.procedure || data.procedure.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Procedure is required',
        path: ['procedure'],
      });
    }
  }
});

export type PolicyFormValues = z.infer<typeof policyFormSchema>;

// Keep the old type alias for backward compatibility
export type PolicyFormData = PolicyFormValues;

export const POLICY_TYPES = [
  { value: 'RP', label: 'RP - Recovery Point Policy' },
  { value: 'HR', label: 'HR - Human Resources Policy' },
  { value: 'S', label: 'S - Staff Policy' },
  { value: 'Admin', label: 'Admin - Administrative Policy' },
  { value: 'Finance', label: 'Finance - Financial Policy' },
  { value: 'OTHER', label: 'Other Policy Type' },
];
