import { supabase } from '@/integrations/supabase/client';

export interface Policy {
  id: string;
  name: string | null;
  policy_number: string | null;
  policy_text: string | null;
  procedure: string | null;
  purpose: string | null;
  reviewer: string | null;
  status: string | null;
  created_at: string;
}

const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export const fetchPoliciesByPrefix = async (prefix: string): Promise<Policy[]> => {
  const { data, error } = await supabase
    .from('Policies')
    .select('*')
    .eq('status', 'published')
    .ilike('policy_number', `${prefix}%`)
    .order('policy_number', { ascending: true });

  if (error) {
    console.error('Error fetching policies:', error);
    throw error;
  }

  return data || [];
};

export const generateManualHTML = (type: 'HR' | 'Facility', policies: Policy[], compilationDate: string): string => {
  const manualTitle = `Recovery Point West Virginia ${type} Policy Manual`;
  const totalPages = 2 + policies.length; // Cover + TOC + policies
  
  // Generate TOC rows - single continuous table
  let tocRows = '';
  let currentPage = 3; // Start after cover page and TOC
  
  policies.forEach((policy) => {
    const policyTitle = policy.name || 'Untitled Policy';
    const policyNumber = policy.policy_number || 'N/A';
    
    tocRows += `<tr class="toc-row"><td class="toc-policy-number">${policyNumber}</td><td class="toc-policy-title"><a href="#policy-${policy.id}" class="toc-link">${policyTitle}</a></td><td class="toc-page-number">${currentPage}</td></tr>`;
    currentPage++;
  });

  // Generate Policy Content
  let policyContent = '';
  let pageNumber = 3;
  policies.forEach((policy) => {
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

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${manualTitle}</title>
        <style>
          /* Print-optimized styles */
          @media print {
            @page {
              margin: 0.75in;
              size: letter;
            }
            
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            .policy-page, .cover-page, .toc-page {
              page-break-before: always;
              page-break-after: always;
              position: relative;
              min-height: 9.5in;
              max-height: 9.5in;
              overflow: hidden;
            }
            
            .cover-page {
              page-break-before: avoid;
            }
            
            .policy-section {
              page-break-inside: avoid;
            }

            .page-header {
              page-break-inside: avoid;
            }
            
            /* TOC Table Print Styles - Board Standard */
            .toc-table {
              page-break-inside: avoid;
              break-inside: avoid;
              border-collapse: collapse;
              width: 100%;
            }

            .toc-table thead {
              display: table-header-group;
            }

            .toc-table tbody {
              display: table-row-group;
            }

            .toc-row {
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .toc-table td, .toc-table th {
              page-break-inside: avoid;
              break-inside: avoid;
            }

            /* Hide links for print */
            .toc-link {
              color: inherit !important;
              text-decoration: none !important;
            }

            /* Ensure clean page separation */
            .cover-page::after {
              content: "";
              display: block;
              page-break-after: always;
            }

            .toc-page::before {
              content: "";
              display: block;
              clear: both;
            }
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
            background: white;
          }
          
          /* Cover Page Styles */
          .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100vh;
            text-align: center;
            padding: 2in 1in;
            position: relative;
            isolation: isolate;
          }
          
          .cover-logo {
            width: 300px;
            height: auto;
            margin: 0 auto 1.5in auto;
            max-width: 100%;
          }
          
          .cover-title {
            font-size: 32pt;
            font-weight: bold;
            margin-bottom: 0.5in;
            color: #1565c0;
            text-transform: uppercase;
            letter-spacing: 2px;
            line-height: 1.1;
          }
          
          .cover-subtitle {
            font-size: 18pt;
            margin-bottom: 1.5in;
            color: #333;
            font-weight: 500;
          }
          
          .cover-bottom {
            margin-top: auto;
          }
          
          .compilation-date {
            font-size: 14pt;
            color: #666;
            font-weight: bold;
            margin-bottom: 0.3in;
          }

          .organization-info {
            font-size: 12pt;
            color: #666;
            line-height: 1.4;
          }

          /* Table of Contents Page Styles */
          .toc-page {
            padding: 0;
            position: relative;
            min-height: 9.5in;
            max-height: 9.5in;
            isolation: isolate;
            background: white;
          }
          
          .toc-main-title {
            font-size: 28pt;
            font-weight: bold;
            text-align: center;
            margin: 0 0 0.6in 0;
            color: #1565c0;
            text-transform: uppercase;
            letter-spacing: 2px;
            padding-bottom: 0.2in;
            border-bottom: 3px solid #1565c0;
          }
          
          /* Page Header Styles - Only for Policy Pages */
          .policy-page .page-header {
            border-bottom: 1px solid #ddd;
            padding-bottom: 12px;
            margin-bottom: 24px;
          }

          .policy-page .header-content {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 15px;
          }

          .policy-page .header-logo {
            height: 30px;
            width: auto;
          }

          .policy-page .header-text {
            font-size: 10pt;
            font-weight: 600;
            color: #1565c0;
          }

          /* Page Footer Styles - Different for each page type */
          .cover-page .page-footer {
            display: none;
          }

          .toc-page .page-footer {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 100%;
            text-align: right;
            background: white;
            z-index: 10;
          }

          .policy-page .page-footer {
            position: absolute;
            bottom: 0.75in;
            right: 0;
            width: 100%;
            text-align: right;
          }
          
          .page-number {
            font-size: 10pt;
            color: #666;
            font-weight: 500;
          }
          
          /* TOC Table Styles - Board Standard */
          .toc-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11pt;
            border: 2px solid #1565c0;
            margin-bottom: 1in;
            clear: both;
          }
          
          .toc-table th {
            background-color: #1565c0;
            color: white;
            padding: 12px 15px;
            font-weight: bold;
            font-size: 12pt;
            border-bottom: 2px solid #1565c0;
          }

          .toc-table th:first-child {
            width: 18%;
            text-align: left;
          }

          .toc-table th:nth-child(2) {
            width: 67%;
            text-align: left;
          }

          .toc-table th:last-child {
            width: 15%;
            text-align: right;
          }
          
          .toc-table td {
            padding: 8px 15px;
            border-bottom: 1px solid #e0e0e0;
            vertical-align: top;
            font-size: 11pt;
            line-height: 1.3;
          }

          .toc-row {
            background-color: white;
          }

          .toc-row:nth-child(even) {
            background-color: #f8f9fa;
          }

          .toc-row:hover {
            background-color: #e3f2fd;
          }
          
          .toc-policy-number {
            font-weight: bold;
            color: #1565c0;
            font-family: 'Courier New', monospace;
            text-align: left;
            white-space: nowrap;
          }
          
          .toc-policy-title {
            text-align: left;
            color: #333;
            font-weight: normal;
            word-wrap: break-word;
          }
          
          .toc-page-number {
            text-align: right;
            font-weight: bold;
            color: #1565c0;
            white-space: nowrap;
          }

          .toc-link {
            color: inherit;
            text-decoration: none;
            cursor: pointer;
          }

          .toc-link:hover {
            text-decoration: underline;
            color: #1565c0;
          }
          
          /* Policy Page Styles */
          .policy-page {
            padding: 0;
            position: relative;
            min-height: 9.5in;
          }
          
          .policy-content {
            margin-bottom: 80px; /* Space for footer */
          }
          
          .policy-title-section {
            margin-bottom: 30px;
          }
          
          .policy-title {
            font-size: 22pt;
            font-weight: bold;
            margin: 0;
            color: #1565c0;
            text-transform: uppercase;
            letter-spacing: 1px;
            line-height: 1.2;
          }
          
          .policy-divider {
            height: 2px;
            background-color: #1565c0;
            margin: 15px 0 0 0;
          }
          
          .policy-metadata-box {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-left: 4px solid #1565c0;
            padding: 20px;
            margin: 0 0 30px 0;
          }

          .metadata-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .metadata-item {
            display: flex;
            align-items: flex-start;
          }

          .metadata-label {
            font-weight: bold;
            color: #1565c0;
            width: 100px;
            flex-shrink: 0;
            font-size: 10pt;
          }

          .metadata-value {
            color: #333;
            font-size: 11pt;
            flex: 1;
            margin-left: 10px;
          }
          
          .policy-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            margin: 0 0 15px 0;
            color: #1565c0;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #1565c0;
            padding-bottom: 6px;
          }
          
          .section-content {
            line-height: 1.5;
            text-align: justify;
            font-size: 12pt;
          }
          
          .section-content p {
            margin-bottom: 12px;
          }
          
          .section-content ul, .section-content ol {
            margin: 12px 0 12px 20px;
            padding: 0;
          }
          
          .section-content li {
            margin-bottom: 6px;
            line-height: 1.4;
          }
          
          .section-content h1, .section-content h2, .section-content h3 {
            color: #1565c0;
            margin: 20px 0 12px 0;
            font-weight: bold;
            text-transform: uppercase;
          }

          .section-content h1 {
            font-size: 14pt;
          }

          .section-content h2 {
            font-size: 13pt;
          }

          .section-content h3 {
            font-size: 12pt;
          }
          
          @media screen {
            body {
              padding: 20px;
              max-width: 8.5in;
              margin: 0 auto;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }

            .page-footer {
              position: relative;
              bottom: auto;
              text-align: right;
              margin-top: 20px;
            }
            
            .policy-content {
              margin-bottom: 20px;
            }
          }
        </style>
      </head>
      <body>
        <!-- Cover Page -->
        <div class="cover-page">
          <div>
            <img src="/lovable-uploads/07b7c8f7-302d-4fa4-add8-69e1b84285ac.png" alt="Recovery Point West Virginia Logo" class="cover-logo">
            <h1 class="cover-title">${manualTitle}</h1>
            <p class="cover-subtitle">Comprehensive Policy Collection</p>
          </div>
          <div class="cover-bottom">
            <p class="compilation-date">Compiled on ${compilationDate}</p>
            <div class="organization-info">
              Recovery Point West Virginia<br>
              1007 Washington Street East, Charleston, WV 25301<br>
              www.recoverypointwv.com
            </div>
          </div>
        </div>

        <!-- Table of Contents -->
        <div class="toc-page">
          <h1 class="toc-main-title">Table of Contents</h1>
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

          <div class="page-footer">
            <span class="page-number">Page 2 of ${totalPages}</span>
          </div>
        </div>

        <!-- Policy Content -->
        ${policyContent}
      </body>
    </html>
  `;
};
