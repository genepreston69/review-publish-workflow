
export const generatePolicyPrintTemplate = (
  policyName: string,
  policyNumber: string,
  policyType: string,
  policyContent: string,
  reviewer: string,
  createdAt: string,
  status: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Policy Print - ${policyNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .policy-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1565c0;
            padding-bottom: 20px;
          }
          
          .policy-title {
            font-size: 24px;
            font-weight: bold;
            color: #1565c0;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          
          .policy-number {
            font-size: 16px;
            font-weight: bold;
            color: #666;
            margin-bottom: 5px;
          }
          
          .policy-metadata {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #1565c0;
          }
          
          .metadata-item {
            display: flex;
            flex-direction: column;
          }
          
          .metadata-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
          }
          
          .metadata-value {
            color: #333;
            font-size: 14px;
          }
          
          .policy-content {
            margin: 0;
            padding: 0;
          }
          
          .policy-content h1,
          .policy-content h2,
          .policy-content h3 {
            color: #1565c0;
            font-weight: bold;
            text-transform: uppercase;
            margin: 20px 0 12px 0;
          }
          
          .policy-content h1 {
            font-size: 18px;
          }
          
          .policy-content h2 {
            font-size: 16px;
          }
          
          .policy-content h3 {
            font-size: 14px;
          }
          
          .policy-content p {
            margin-bottom: 12px;
            text-align: justify;
          }
          
          .policy-content ul,
          .policy-content ol {
            margin: 12px 0 12px 20px;
            padding: 0;
          }
          
          .policy-content li {
            margin-bottom: 6px;
            text-align: justify;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
            
            .no-print {
              display: none;
            }
            
            .policy-section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="policy-header">
          <div class="policy-title">${policyName || 'Untitled Policy'}</div>
          <div class="policy-number">Policy Number: ${policyNumber || 'N/A'}</div>
        </div>
        
        <div class="policy-metadata">
          <div class="metadata-item">
            <span class="metadata-label">Type</span>
            <span class="metadata-value">${policyType || 'N/A'}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Status</span>
            <span class="metadata-value">${status || 'N/A'}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Reviewer</span>
            <span class="metadata-value">${reviewer || 'N/A'}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Created</span>
            <span class="metadata-value">${new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        ${policyContent ? `
          <div class="policy-content">
            ${policyContent}
          </div>
        ` : '<p>No policy content available.</p>'}
      </body>
    </html>
  `;
};
