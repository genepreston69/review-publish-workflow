
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
  
  // Calculate TOC pages needed (approximately 20-25 entries per page)
  const entriesPerPage = 20;
  const tocPages = Math.max(1, Math.ceil(policies.length / entriesPerPage));
  
  // Calculate total pages: Cover (1) + TOC pages + Policy pages
  const totalPages = 1 + tocPages + policies.length;
  
  console.log('TOC Pages Calculated:', tocPages);
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
