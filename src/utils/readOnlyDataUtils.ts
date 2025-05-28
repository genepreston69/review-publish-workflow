
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
  
  // Convert common HTML elements to text with proper spacing
  // Replace <br>, <p>, <div> tags with line breaks
  let processedHtml = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '');
  
  // Set the processed HTML and get text content
  tempDiv.innerHTML = processedHtml;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up extra whitespace but preserve intentional line breaks
  return textContent
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple line breaks with double line breaks
    .replace(/^\s+|\s+$/g, '') // Trim start and end
    .replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
};

export const convertPoliciesToContent = (policies: any[]): Content[] => {
  return policies.map(policy => {
    const fullPolicyText = stripHtml(policy.policy_text || '');
    console.log('Original policy text length:', policy.policy_text?.length);
    console.log('Stripped policy text length:', fullPolicyText.length);
    console.log('Policy text preview:', fullPolicyText.substring(0, 200) + '...');
    
    return {
      id: policy.id,
      title: policy.name || 'Untitled Policy',
      body: fullPolicyText,
      status: 'published' as const,
      authorId: '',
      createdAt: new Date(policy.created_at),
      updatedAt: new Date(policy.created_at),
      publishedAt: new Date(policy.created_at),
    };
  });
};
