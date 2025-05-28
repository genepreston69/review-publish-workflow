
import { Content } from '@/types/content';

export const filterContents = (contents: Content[], searchTerm: string): Content[] => {
  return contents.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.body.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const filterPolicies = (policies: any[], searchTerm: string): any[] => {
  return policies.filter(policy =>
    policy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.policy_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const convertPoliciesToContent = (policies: any[]): Content[] => {
  return policies.map(policy => ({
    id: policy.id,
    title: policy.name || 'Untitled Policy',
    body: policy.policy_text || '',
    status: 'published' as const,
    authorId: '',
    createdAt: new Date(policy.created_at),
    updatedAt: new Date(policy.created_at),
    publishedAt: new Date(policy.created_at),
  }));
};
