
export interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  policy_type: string | null;
  purpose: string | null;
  policy_text: string | null;
  procedure: string | null;
  reviewer: string | null;
  created_at: string;
  status: string | null;
  creator_id: string | null;
  publisher_id: string | null;
  reviewer_comment: string | null;
  published_at: string | null;
  updated_at: string | null;
  archived_at: string | null;
  parent_policy_id: string | null;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  publisher?: {
    id: string;
    name: string;
    email: string;
  };
}

export type ManualType = 'HR' | 'Facility';
