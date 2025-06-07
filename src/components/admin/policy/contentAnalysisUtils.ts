
import { Policy } from './types';

// Strip HTML and count approximate word count
const getWordCount = (html: string | null): number => {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, '').trim();
  // Approximate word count (assuming average 5 chars per word)
  return Math.ceil(text.length / 5);
};

// Estimate how many pages a policy will take based on content
export const estimatePolicyPages = (policy: Policy): number => {
  const purposeWords = getWordCount(policy.purpose);
  const policyWords = getWordCount(policy.policy_text);
  const procedureWords = getWordCount(policy.procedure);
  
  const totalWords = purposeWords + policyWords + procedureWords;
  
  // Add base overhead for metadata, titles, and spacing (about 150 words equivalent)
  const adjustedWords = totalWords + 150;
  
  // Conservative estimate: 300 words per page (including formatting, headers, spacing)
  const estimatedPages = Math.max(1, Math.ceil(adjustedWords / 300));
  
  return estimatedPages;
};

// Classify policy size based on word count thresholds
export const getPolicySize = (policy: Policy): 'short' | 'medium' | 'long' => {
  const purposeWords = getWordCount(policy.purpose);
  const policyWords = getWordCount(policy.policy_text);
  const procedureWords = getWordCount(policy.procedure);
  
  const totalWords = purposeWords + policyWords + procedureWords;
  
  if (totalWords < 800) return 'short';
  if (totalWords < 1500) return 'medium';
  return 'long';
};

// Group policies for optimal page utilization
export interface PolicyGroup {
  policies: Policy[];
  estimatedPages: number;
  groupType: 'single-long' | 'multi-short' | 'mixed';
}

export const groupPoliciesForPagination = (policies: Policy[]): PolicyGroup[] => {
  const groups: PolicyGroup[] = [];
  let currentGroup: Policy[] = [];
  let currentGroupPages = 0;
  
  for (const policy of policies) {
    const policyPages = estimatePolicyPages(policy);
    const policySize = getPolicySize(policy);
    
    // Start new group if:
    // - Current policy is long and should start fresh
    // - Current group would exceed 3 pages with this addition
    // - Mixing policy types (HR vs Facility) unnecessarily
    const shouldStartNewGroup = 
      (policySize === 'long' && currentGroup.length > 0) ||
      (currentGroupPages + policyPages > 3) ||
      (currentGroup.length >= 3); // Limit to 3 short policies per group
    
    if (shouldStartNewGroup && currentGroup.length > 0) {
      // Finalize current group
      const groupType = currentGroup.length === 1 && getPolicySize(currentGroup[0]) === 'long' 
        ? 'single-long' 
        : currentGroup.every(p => getPolicySize(p) === 'short') 
          ? 'multi-short' 
          : 'mixed';
      
      groups.push({
        policies: [...currentGroup],
        estimatedPages: currentGroupPages,
        groupType
      });
      
      currentGroup = [];
      currentGroupPages = 0;
    }
    
    currentGroup.push(policy);
    currentGroupPages += policyPages;
  }
  
  // Add final group if it exists
  if (currentGroup.length > 0) {
    const groupType = currentGroup.length === 1 && getPolicySize(currentGroup[0]) === 'long' 
      ? 'single-long' 
      : currentGroup.every(p => getPolicySize(p) === 'short') 
        ? 'multi-short' 
        : 'mixed';
    
    groups.push({
      policies: [...currentGroup],
      estimatedPages: currentGroupPages,
      groupType
    });
  }
  
  return groups;
};
