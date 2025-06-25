
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
  } | null;
  publisher?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface PolicyRevision {
  id: string;
  policy_id: string;
  revision_number: number;
  field_name: string;
  original_content: string | null;
  modified_content: string;
  change_type: 'addition' | 'deletion' | 'modification';
  change_metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  created_by_profile?: {
    id: string;
    name: string;
    email: string;
  } | null;
  reviewed_by_profile?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export type ManualType = 'HR' | 'Facility';
