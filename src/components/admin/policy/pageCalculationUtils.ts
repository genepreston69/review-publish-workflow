
import { MANUAL_CONSTANTS } from './manualConstants';

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

export const calculateTotalPages = (tocPages: number, policyCount: number): number => {
  // Cover (1) + TOC pages + Policy pages
  return 1 + tocPages + policyCount;
};

export const calculatePolicyStartPage = (tocPages: number): number => {
  return tocPages + 1;
};
