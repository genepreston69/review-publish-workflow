
import { z } from 'zod';

export const policyFormSchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  policy_type: z.string().min(1, 'Policy type is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  procedure: z.string().min(1, 'Procedure is required'),
  policy_text: z.string().min(1, 'Policy text is required'),
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
