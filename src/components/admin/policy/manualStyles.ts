
export const getManualStyles = (): string => {
  return `
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
        position: relative;
        min-height: 9in;
        padding-bottom: 1in;
      }
      
      .cover-page {
        page-break-before: avoid;
        page-break-after: always;
      }
      
      .policy-section {
        page-break-inside: avoid;
      }

      .page-header {
        page-break-inside: avoid;
      }
      
      /* TOC Table Print Styles - Allow multi-page TOC */
      .toc-page {
        page-break-after: auto;
        min-height: auto;
        max-height: none;
      }

      .toc-table-container {
        max-height: none !important;
        overflow: visible !important;
      }

      .toc-table {
        page-break-inside: auto;
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

      /* TOC page break handling */
      .toc-page-break {
        page-break-before: always;
      }

      /* Hide links for print but keep them functional */
      .toc-link {
        color: inherit !important;
        text-decoration: none !important;
      }

      /* Fixed page footer positioning - prevent bleeding */
      .page-footer {
        position: fixed !important;
        bottom: 0.5in !important;
        right: 0.75in !important;
        left: auto !important;
        width: auto !important;
        text-align: right !important;
        background: white;
        z-index: 1000;
        padding: 0.1in 0 !important;
        margin: 0 !important;
      }

      /* Ensure TOC content doesn't overlap with footer */
      .toc-content {
        margin-bottom: 1.5in !important;
      }

      .policy-content {
        margin-bottom: 1.5in !important;
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
      padding-bottom: 1.5in;
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

    /* Page Footer Styles - Fixed positioning */
    .page-footer {
      position: absolute;
      bottom: 0.5in;
      right: 0;
      left: auto;
      width: auto;
      text-align: right;
      background: white;
      z-index: 10;
      padding: 0.1in 0;
      margin: 0;
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
      margin-bottom: 0.5in;
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
      color: #1565c0;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toc-link:hover {
      text-decoration: underline;
      color: #0d47a1;
      font-weight: 500;
    }
    
    /* Policy Page Styles */
    .policy-page {
      padding: 0;
      position: relative;
      min-height: 9in;
      display: flex;
      flex-direction: column;
    }
    
    .policy-content {
      flex: 1;
      margin-bottom: 1.5in;
      overflow: hidden;
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
        flex: none;
      }

      .toc-content {
        flex: none;
        padding-bottom: 20px;
      }

      .toc-table-container {
        max-height: none;
      }
    }
  `;
};
