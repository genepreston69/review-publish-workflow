
export const getContentStyles = (): string => {
  return `
    /* Simple Pagination - Remove unnecessary page breaks */
    .policy-section {
      margin-bottom: 25px;
      page-break-inside: avoid; /* Keep short policies together */
      orphans: 2;
      widows: 2;
    }
    
    .policy-purpose {
      /* Remove any page breaks after purpose - let content flow naturally */
    }
    
    .major-section-header {
      page-break-before: always; /* Only break before major sections */
    }
    
    /* TOC Table Styles */
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
    
    /* Policy Content Styles */
    .policy-title-section {
      margin-bottom: 30px;
      page-break-after: avoid;
      break-after: avoid;
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
      page-break-inside: avoid;
      break-inside: avoid;
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
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #1565c0;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #1565c0;
      padding-bottom: 6px;
      page-break-after: avoid;
      break-after: avoid;
    }
    
    .section-content {
      line-height: 1.5;
      text-align: justify;
      font-size: 12pt;
      orphans: 3;
      widows: 3;
    }
    
    .section-content p {
      margin-bottom: 12px;
      orphans: 2;
      widows: 2;
    }
    
    .section-content ul, .section-content ol {
      margin: 12px 0 12px 20px;
      padding: 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    .section-content li {
      margin-bottom: 6px;
      line-height: 1.4;
      orphans: 2;
      widows: 2;
    }
    
    .section-content h1, .section-content h2, .section-content h3 {
      color: #1565c0;
      margin: 20px 0 12px 0;
      font-weight: bold;
      text-transform: uppercase;
      page-break-after: avoid;
      break-after: avoid;
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
  `;
};
