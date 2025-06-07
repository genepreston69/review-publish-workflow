
export const getPrintStyles = (): string => {
  return `
    /* Print-optimized styles with minimal page breaks */
    @media print {
      @page {
        margin: 0.75in 0.75in 1.25in 0.75in;
        size: letter;
        
        @bottom-right {
          content: counter(page);
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10pt;
          color: #666;
          margin-bottom: 0.25in;
          margin-right: 0;
        }
        
        @top-left { content: none; }
        @top-center { content: none; }
        @top-right { content: none; }
      }
      
      body {
        counter-reset: page 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        orphans: 3;
        widows: 3;
      }
      
      /* Cover page - no page number */
      .cover-page {
        page: cover;
        page-break-after: always;
        min-height: 100vh;
        padding-bottom: 0;
      }
      
      @page cover {
        margin: 0.75in;
        @bottom-right {
          content: none;
        }
        @top-left { content: none; }
        @top-center { content: none; }
        @top-right { content: none; }
      }
      
      /* TOC and Policy pages - with page numbers */
      .toc-page, .policy-page {
        page: content;
      }
      
      @page content {
        margin: 0.75in 0.75in 1.25in 0.75in;
        @bottom-right {
          content: counter(page);
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10pt;
          color: #666;
          margin-bottom: 0.25in;
          margin-right: 0;
        }
        @top-left { content: none; }
        @top-center { content: none; }
        @top-right { content: none; }
      }
      
      .page-footer {
        display: none !important;
      }
      
      /* Page break after TOC */
      .toc-page {
        page-break-after: always !important;
        min-height: auto;
        max-height: none;
      }
      
      /* Page break after each policy */
      .policy-page {
        page-break-after: always !important;
        break-after: always !important;
        position: relative;
        min-height: auto;
        padding-bottom: 0;
      }
      
      /* Let policy sections flow naturally within a policy */
      .policy-section {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        orphans: 2 !important;
        widows: 2 !important;
        page-break-after: auto !important;
        break-after: auto !important;
      }
      
      /* No page breaks after PURPOSE - let content flow */
      .policy-purpose {
        page-break-after: auto !important;
        break-after: auto !important;
      }
      
      /* No automatic page breaks for major section headers */
      .major-section-header {
        page-break-before: auto !important;
        break-before: auto !important;
      }
      
      .policy-title-section,
      .policy-metadata-box {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }

      .page-header {
        page-break-inside: avoid;
        page-break-after: avoid;
        break-after: avoid;
      }
      
      .policy-anchor {
        position: absolute;
        top: 0;
        left: 0;
        visibility: hidden;
        height: 0;
        width: 0;
        display: block;
      }

      .toc-main-title {
        page-break-after: avoid;
        margin-bottom: 1em;
      }

      .toc-table-container {
        max-height: none !important;
        overflow: visible !important;
      }

      .toc-table {
        page-break-inside: auto;
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;
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
        padding: 8px 12px;
        border-bottom: 1px solid #e5e7eb;
      }

      .toc-link {
        color: inherit !important;
        text-decoration: none !important;
      }

      .toc-content {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }

      .policy-content {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }

      .cover-content {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }

      .toc-table th {
        font-weight: bold;
        background-color: #f8f9fa;
        border-bottom: 2px solid #dee2e6;
        font-size: 12pt;
        padding: 6px 12px;
      }

      .toc-table td {
        font-size: 11pt;
        padding: 4px 12px;
        line-height: 1.3;
      }

      .toc-policy-number {
        width: 15%;
      }

      .toc-policy-title {
        width: 70%;
      }

      .toc-page-number {
        width: 15%;
        text-align: right;
      }

      .section-content p {
        orphans: 2 !important;
        widows: 2 !important;
        margin-bottom: 8px !important;
      }

      .section-content ul, .section-content ol {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      .section-content li {
        orphans: 2 !important;
        widows: 2 !important;
      }

      .section-title {
        page-break-after: avoid !important;
        break-after: avoid !important;
        orphans: 3 !important;
      }
    }
  `;
};
