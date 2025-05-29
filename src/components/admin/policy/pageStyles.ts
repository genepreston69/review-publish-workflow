
export const getPageStyles = (): string => {
  return `
    /* Cover Page Styles */
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
      padding: 2in 1in;
      position: relative;
      isolation: isolate;
      background: white;
    }
    
    .cover-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 6in;
    }
    
    .cover-logo {
      width: 250px;
      height: auto;
      margin-bottom: 1in;
      max-width: 100%;
    }
    
    .cover-title {
      font-size: 28pt;
      font-weight: bold;
      margin-bottom: 0.3in;
      color: #1565c0;
      text-transform: uppercase;
      letter-spacing: 2px;
      line-height: 1.1;
    }
    
    .cover-subtitle {
      font-size: 16pt;
      margin-bottom: 1in;
      color: #333;
      font-weight: 500;
    }
    
    .compilation-date {
      font-size: 14pt;
      color: #666;
      font-weight: bold;
      margin-bottom: 0.5in;
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
      isolation: isolate;
      background: white;
      display: flex;
      flex-direction: column;
    }

    .toc-content {
      flex: 1;
      overflow: visible;
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

    .toc-table-container {
      overflow: visible;
      max-height: none;
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

    /* Hide page footer completely - CSS @page handles page numbers */
    .page-footer {
      display: none;
    }
    
    .page-number {
      display: none;
    }
    
    /* Policy Page Styles */
    .policy-page {
      padding: 0;
      position: relative;
      min-height: auto;
      display: flex;
      flex-direction: column;
    }
    
    .policy-content {
      flex: 1;
      overflow: hidden;
    }
  `;
};
