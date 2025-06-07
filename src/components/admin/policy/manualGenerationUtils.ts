
import { Policy, ManualType } from './types';
import { getManualStyles } from './manualStyles';
import { generateCoverPage, generateTableOfContents, generatePolicyContent } from './htmlGenerators';
import { calculateContentAwareTotalPages } from './pageCalculationUtils';

export { fetchPoliciesByPrefix } from './policyFetcher';
export type { Policy, ManualType } from './types';

export const generateManualHTML = (type: ManualType, policies: Policy[], compilationDate: string): string => {
  const manualTitle = `Recovery Point West Virginia ${type} Policy Manual`;
  
  // Use content-aware page calculation
  const { totalPages, tocPages } = calculateContentAwareTotalPages(policies);
  
  const coverPage = generateCoverPage(type, compilationDate, totalPages);
  const tableOfContents = generateTableOfContents(policies, totalPages, tocPages);
  const policyContent = generatePolicyContent(type, policies);

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
