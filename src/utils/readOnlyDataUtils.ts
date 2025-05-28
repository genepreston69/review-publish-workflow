
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

const stripHtml = (html: string): string => {
  if (!html) return '';
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  // Return the text content without HTML tags
  return tempDiv.textContent || tempDiv.innerText || '';
};

export const convertPoliciesToContent = (policies: any[]): Content[] => {
  return policies.map(policy => {
    const fullPolicyText = stripHtml(policy.policy_text || '');
    return {
      id: policy.id,
      title: policy.name || 'Untitled Policy',
      body: fullPolicyText, // Use the complete stripped HTML text
      status: 'published' as const,
      authorId: '',
      createdAt: new Date(policy.created_at),
      updatedAt: new Date(policy.created_at),
      publishedAt: new Date(policy.created_at),
    };
  });
};
