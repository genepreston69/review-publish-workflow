
import { Policy, ManualType } from './types';
import { MANUAL_CONSTANTS } from './manualConstants';
import { calculateTocPages, calculatePolicyStartPage } from './pageCalculationUtils';

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
        <img src="${MANUAL_CONSTANTS.LOGO_PATH}" alt="Recovery Point West Virginia Logo" class="cover-logo">
        <h1 class="cover-title">${manualTitle}</h1>
        <p class="cover-subtitle">Comprehensive Policy Collection</p>
        <p class="compilation-date">Compiled on ${compilationDate}</p>
        <div class="organization-info">
          ${MANUAL_CONSTANTS.ORGANIZATION.name}<br>
          ${MANUAL_CONSTANTS.ORGANIZATION.address}<br>
          ${MANUAL_CONSTANTS.ORGANIZATION.website}
        </div>
      </div>
    </div>
  `;
};

export const generateTableOfContents = (policies: Policy[], totalPages: number, tocPages: number): string => {
  const policyStartPage = calculatePolicyStartPage(tocPages);
  
  let allTocRows = '';
  
  policies.forEach((policy, index) => {
    const policyTitle = policy.name || 'Untitled Policy';
    const policyNumber = policy.policy_number || 'N/A';
    const policyPageNumber = policyStartPage + index;
    
    allTocRows += `<tr class="toc-row">
      <td class="toc-policy-number">${policyNumber}</td>
      <td class="toc-policy-title">
        <a href="#policy-${policy.id}" class="toc-link">${policyTitle}</a>
      </td>
      <td class="toc-page-number">${policyPageNumber}</td>
    </tr>`;
  });

  const tocContent = `
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
              ${allTocRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return tocContent;
};

export const generatePolicyContent = (type: ManualType, policies: Policy[], totalPages: number, tocPages: number): string => {
  const policyStartPage = calculatePolicyStartPage(tocPages);
  
  let policyContent = '';
  
  policies.forEach((policy, index) => {
    const currentPageNumber = policyStartPage + index;
    
    policyContent += `
      <div class="policy-page">
        <!-- Anchor for TOC navigation - placed at the very top of the page -->
        <a id="policy-${policy.id}" name="policy-${policy.id}" class="policy-anchor"></a>
        
        <div class="page-header">
          <div class="header-content">
            <img src="${MANUAL_CONSTANTS.LOGO_PATH}" alt="Recovery Point West Virginia Logo" class="header-logo">
            <span class="header-text">${MANUAL_CONSTANTS.ORGANIZATION.name} ${type} Policy Manual</span>
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
      </div>
    `;
  });

  return policyContent;
};
