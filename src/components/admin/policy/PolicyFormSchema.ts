
import { z } from 'zod';

export const policyFormSchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  policy_type: z.string().min(1, 'Policy type is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  procedure: z.string().min(1, 'Procedure is required'),
  policy_text: z.string().min(1, 'Policy text is required'),
});

export type PolicyFormValues = z.infer<typeof policyFormSchema>;

export const POLICY_TYPES = [
  { value: 'RP', label: 'RP - Recovery Point Policy' },
  { value: 'HR', label: 'HR - Human Resources Policy' },
  { value: 'S', label: 'S - Staff Policy' },
  { value: 'OTHER', label: 'Other Policy Type' },
];
