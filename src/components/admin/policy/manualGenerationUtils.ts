
import { Policy, ManualType } from './types';
import { getManualStyles } from './manualStyles';
import { generateCoverPage, generateTableOfContents, generatePolicyContent } from './htmlGenerators';

export { fetchPoliciesByPrefix } from './policyFetcher';
export type { Policy, ManualType } from './types';

export const generateManualHTML = (type: ManualType, policies: Policy[], compilationDate: string): string => {
  console.log('=== MANUAL GENERATION START ===');
  console.log('Manual Type:', type);
  console.log('Total Policies Received:', policies.length);
  console.log('Policies List:', policies.map(p => ({ 
    id: p.id, 
    number: p.policy_number, 
    name: p.name 
  })));
  
  const manualTitle = `Recovery Point West Virginia ${type} Policy Manual`;
  
  // Calculate TOC pages needed - accounting for header space on first page
  const entriesOnFirstPage = 19; // 20 - 1 for header space
  const entriesOnSubsequentPages = 20;
  
  let tocPages: number;
  if (policies.length <= entriesOnFirstPage) {
    tocPages = 1;
  } else {
    // First page + additional pages for remaining entries
    tocPages = 1 + Math.ceil((policies.length - entriesOnFirstPage) / entriesOnSubsequentPages);
  }
  
  // Calculate total pages: Cover (1) + TOC pages + Policy pages
  const totalPages = 1 + tocPages + policies.length;
  
  console.log('TOC Pages Calculated:', tocPages);
  console.log('- Entries on first page:', Math.min(policies.length, entriesOnFirstPage));
  console.log('- Remaining entries:', Math.max(0, policies.length - entriesOnFirstPage));
  console.log('- Additional pages needed:', Math.max(0, Math.ceil((policies.length - entriesOnFirstPage) / entriesOnSubsequentPages)));
  console.log('Total Pages Calculated:', totalPages);
  console.log('Policy pages will start on page:', 1 + tocPages + 1);
  
  const coverPage = generateCoverPage(type, compilationDate, totalPages);
  const tableOfContents = generateTableOfContents(policies, totalPages, tocPages);
  const policyContent = generatePolicyContent(type, policies, totalPages, tocPages);

  console.log('=== MANUAL GENERATION COMPLETE ===');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${manualTitle}</title>
        <style>
          ${getManualStyles()}
        </style>
      </head>
      <body>
        ${coverPage}
        ${tableOfContents}
        ${policyContent}
      </body>
    </html>
  `;
};
