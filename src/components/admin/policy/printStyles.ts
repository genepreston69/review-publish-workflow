
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
      
      .page-break {
        page-break-before: always;
      }
      
      .policy-page, .cover-page, .toc-page {
        page-break-before: always;
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
      
      /* Force page break after final TOC page */
      .toc-final-page-break {
        page-break-after: always;
      }
      
      .policy-section {
        page-break-inside: avoid;
      }

      .page-header {
        page-break-inside: avoid;
      }
      
      /* TOC Table Print Styles */
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

      .toc-page-break {
        page-break-before: always;
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
    }
  `;
};
