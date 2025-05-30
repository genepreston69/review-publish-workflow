
import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(1, 'Form name is required'),
  form_type: z.string().min(1, 'Form type is required'),
  purpose: z.string().optional(),
  reviewer: z.string().optional(),
  form_content: z.string().optional(),
  status: z.string().default('draft'),
});

export type FormData = z.infer<typeof formSchema>;

export interface Form {
  id: string;
  name: string | null;
  form_number: string | null;
  form_content: string | null;
  form_type: string;
  purpose: string | null;
  reviewer: string | null;
  status: string | null;
  created_at: string;
}
