
import { Policy, ManualType } from './types';

const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export const generateCoverPage = (type: ManualType, compilationDate: string, totalPages: number): string => {
  const manualTitle = `Recovery Point West Virginia ${type} Policy Manual`;
  
  return `
    <!-- Cover Page -->
    <div class="cover-page">
      <div class="cover-content">
        <img src="/lovable-uploads/07b7c8f7-302d-4fa4-add8-69e1b84285ac.png" alt="Recovery Point West Virginia Logo" class="cover-logo">
        <h1 class="cover-title">${manualTitle}</h1>
        <p class="cover-subtitle">Comprehensive Policy Collection</p>
        <p class="compilation-date">Compiled on ${compilationDate}</p>
        <div class="organization-info">
          Recovery Point West Virginia<br>
          1007 Washington Street East, Charleston, WV 25301<br>
          www.recoverypointwv.com
        </div>
      </div>
      <div class="page-footer">
        <span class="page-number">Page 1 of ${totalPages}</span>
      </div>
    </div>
  `;
};

export const generateTableOfContents = (policies: Policy[], totalPages: number): string => {
  console.log('Generating TOC for policies:', policies.length, 'policies');
  console.log('Policy IDs:', policies.map(p => ({ id: p.id, number: p.policy_number, name: p.name })));
  
  // Calculate how many TOC pages we'll need (approximately 20-25 entries per page)
  const entriesPerPage = 20;
  const tocPages = Math.ceil(policies.length / entriesPerPage);
  
  // Calculate starting page for policies (cover + TOC pages + 1)
  let policyStartPage = 2 + tocPages;
  
  // Generate TOC rows - single continuous table for ALL policies
  let tocRows = '';
  
  // Ensure we process ALL policies passed to this function
  policies.forEach((policy, index) => {
    const policyTitle = policy.name || 'Untitled Policy';
    const policyNumber = policy.policy_number || 'N/A';
    const policyPage = policyStartPage + index;
    
    console.log(`TOC Entry ${index + 1}: ${policyNumber} - ${policyTitle} (Page ${policyPage})`);
    
    tocRows += `<tr class="toc-row">
      <td class="toc-policy-number">${policyNumber}</td>
      <td class="toc-policy-title">
        <a href="#policy-${policy.id}" class="toc-link">${policyTitle}</a>
      </td>
      <td class="toc-page-number">${policyPage}</td>
    </tr>`;
  });

  console.log('Total TOC rows generated:', policies.length);
  console.log('TOC will span approximately', tocPages, 'pages');

  // Generate TOC page numbers for footer
  let tocPageFooters = '';
  for (let i = 1; i <= tocPages; i++) {
    const pageNum = 1 + i;
    tocPageFooters += `
      <div class="page-footer">
        <span class="page-number">Page ${pageNum} of ${totalPages}</span>
      </div>
    `;
  }

  return `
    <!-- Table of Contents -->
    <div class="toc-page">
      <div class="toc-content">
        <h1 class="toc-main-title">Table of Contents</h1>
        <div class="toc-table-container">
          <table class="toc-table">
            <thead>
              <tr>
                <th>Policy Number</th>
                <th>Policy Title</th>
                <th>Page</th>
              </tr>
            </thead>
            <tbody>
              ${tocRows}
            </tbody>
          </table>
        </div>
      </div>
      <div class="page-footer">
        <span class="page-number">Page 2 of ${totalPages}</span>
      </div>
    </div>
  `;
};

export const generatePolicyContent = (type: ManualType, policies: Policy[], totalPages: number): string => {
  console.log('Generating policy content for policies:', policies.length, 'policies');
  
  // Calculate how many TOC pages we'll need
  const entriesPerPage = 20;
  const tocPages = Math.ceil(policies.length / entriesPerPage);
  
  // Calculate starting page for policies (cover + TOC pages + 1)
  let pageNumber = 2 + tocPages;
  
  let policyContent = '';
  
  // Ensure we process ALL policies passed to this function
  policies.forEach((policy, index) => {
    console.log(`Policy Content ${index + 1}: ${policy.policy_number} - ${policy.name} (Page ${pageNumber})`);
    
    policyContent += `
      <div class="policy-page" id="policy-${policy.id}">
        <div class="page-header">
          <div class="header-content">
            <img src="/lovable-uploads/07b7c8f7-302d-4fa4-add8-69e1b84285ac.png" alt="Recovery Point West Virginia Logo" class="header-logo">
            <span class="header-text">Recovery Point West Virginia ${type} Policy Manual</span>
          </div>
        </div>
        
        <div class="policy-content">
          <div class="policy-title-section">
            <h1 class="policy-title">${policy.name || 'Untitled Policy'}</h1>
            <div class="policy-divider"></div>
          </div>
          
          <div class="policy-metadata-box">
            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="metadata-label">Policy Number:</span>
                <span class="metadata-value">${policy.policy_number || 'Not Assigned'}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Status:</span>
                <span class="metadata-value">${policy.status || 'Draft'}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Reviewer:</span>
                <span class="metadata-value">${policy.reviewer ? stripHtml(policy.reviewer) : 'Not Assigned'}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Created Date:</span>
                <span class="metadata-value">${new Date(policy.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          ${policy.purpose ? `
            <div class="policy-section">
              <h2 class="section-title">PURPOSE</h2>
              <div class="section-content">${policy.purpose}</div>
            </div>
          ` : ''}

          ${policy.policy_text ? `
            <div class="policy-section">
              <h2 class="section-title">POLICY</h2>
              <div class="section-content">${policy.policy_text}</div>
            </div>
          ` : ''}

          ${policy.procedure ? `
            <div class="policy-section">
              <h2 class="section-title">PROCEDURE</h2>
              <div class="section-content">${policy.procedure}</div>
            </div>
          ` : ''}
        </div>

        <div class="page-footer">
          <span class="page-number">Page ${pageNumber} of ${totalPages}</span>
        </div>
      </div>
    `;
    pageNumber++;
  });

  console.log('Total policy pages generated:', policies.length);
  return policyContent;
};
