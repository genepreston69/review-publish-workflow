
export const getPrintStyles = (): string => {
  return `
    /* Print-optimized styles with CSS @page margin boxes */
    @media print {
      @page {
        margin: 0.75in 0.75in 1.25in 0.75in; /* top, right, bottom, left - extra bottom for footer */
        size: letter;
        
        /* CSS @page margin box for page numbers - bottom right */
        @bottom-right {
          content: counter(page);
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10pt;
          color: #666;
          margin-bottom: 0.25in;
          margin-right: 0;
        }
        
        /* Hide any browser-generated headers */
        @top-left { content: none; }
        @top-center { content: none; }
        @top-right { content: none; }
      }
      
      /* Reset page counter for the manual */
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
      }
      
      @page cover {
        margin: 0.75in;
        @bottom-right {
          content: none; /* No page number on cover */
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
      
      /* Remove fallback page footer to avoid content boxes */
      .page-footer {
        display: none !important;
      }
      
      /* Smart Pagination Print Controls */
      .policy-compact {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-before: auto !important;
        break-before: auto !important;
      }
      
      .complex-policy {
        orphans: 3 !important;
        widows: 3 !important;
        page-break-before: auto !important;
        break-before: auto !important;
      }
      
      .section-group {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      .policy-group {
        page-break-before: auto !important;
        break-before: auto !important;
      }
      
      .policy-group.new-group {
        page-break-before: always !important;
        break-before: always !important;
      }
      
      .policy-separator {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        height: 1px;
        background-color: #ddd !important;
        margin: 20px 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .policy-page, .cover-page, .toc-page {
        position: relative;
        min-height: auto; /* Let CSS @page handle spacing */
        padding-bottom: 0; /* Remove excessive padding */
      }
      
      .cover-page {
        page-break-before: avoid;
        page-break-after: always;
        min-height: 100vh;
        padding-bottom: 0;
      }
      
      /* Policy metadata and title sections should stay together */
      .policy-title-section,
      .policy-metadata-box {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }

      .policy-section {
        orphans: 2 !important;
        widows: 2 !important;
      }

      .page-header {
        page-break-inside: avoid;
        page-break-after: avoid;
        break-after: avoid;
      }
      
      /* Policy anchor styling for PDF navigation */
      .policy-anchor {
        position: absolute;
        top: 0;
        left: 0;
        visibility: hidden;
        height: 0;
        width: 0;
        display: block;
      }
      
      /* Enhanced TOC Table Print Styles */
      .toc-page {
        page-break-after: always; /* Force break after TOC to start policies on new page */
        min-height: auto;
        max-height: none;
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
        page-break-inside: auto; /* Allow table to break across pages */
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;
      }

      /* Critical: Make headers repeat on each page */
      .toc-table thead {
        display: table-header-group; /* This makes headers repeat on each page */
      }

      .toc-table tbody {
        display: table-row-group;
      }

      /* Prevent individual rows from breaking */
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

      /* Remove excessive content spacing */
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

      /* Optimize table spacing for maximum entries per page */
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

      /* Column widths for better space utilization */
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

      /* Improve readability with better typography controls */
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
