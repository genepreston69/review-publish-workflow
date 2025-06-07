
import { MANUAL_CONSTANTS } from './manualConstants';
import { Policy } from './types';
import { groupPoliciesForPagination } from './contentAnalysisUtils';

export const calculateTocPages = (totalPolicies: number): number => {
  const { ENTRIES_ON_FIRST_TOC_PAGE, ENTRIES_ON_SUBSEQUENT_TOC_PAGES } = MANUAL_CONSTANTS;
  
  if (totalPolicies <= ENTRIES_ON_FIRST_TOC_PAGE) {
    return 1;
  }
  
  // First page + additional pages for remaining entries
  const remainingEntries = totalPolicies - ENTRIES_ON_FIRST_TOC_PAGE;
  const additionalPages = Math.ceil(remainingEntries / ENTRIES_ON_SUBSEQUENT_TOC_PAGES);
  
  return 1 + additionalPages;
};

// New content-aware total page calculation
export const calculateContentAwareTotalPages = (policies: Policy[]): { totalPages: number; tocPages: number; contentPages: number } => {
  const tocPages = calculateTocPages(policies.length);
  
  // Group policies and calculate actual content pages needed
  const policyGroups = groupPoliciesForPagination(policies);
  const contentPages = policyGroups.reduce((total, group) => total + group.estimatedPages, 0);
  
  // Cover (1) + TOC pages + Content pages
  const totalPages = 1 + tocPages + contentPages;
  
  return {
    totalPages,
    tocPages,
    contentPages
  };
};

// Legacy function for backwards compatibility
export const calculateTotalPages = (tocPages: number, policyCount: number): number => {
  // For legacy calls, use simple calculation
  return 1 + tocPages + policyCount;
};

export const calculatePolicyStartPage = (tocPages: number): number => {
  return tocPages + 1;
};
