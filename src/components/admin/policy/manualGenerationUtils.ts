
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
  const totalPages = 2 + policies.length; // Cover + TOC + policies
  
  console.log('Total Pages Calculated:', totalPages);
  
  const coverPage = generateCoverPage(type, compilationDate, totalPages);
  const tableOfContents = generateTableOfContents(policies, totalPages);
  const policyContent = generatePolicyContent(type, policies, totalPages);

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
        <!-- Policy Content -->
        ${policyContent}
      </body>
    </html>
  `;
};
