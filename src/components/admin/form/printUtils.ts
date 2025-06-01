
export const generatePrintTemplate = (formContent: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Form Print</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .form-content {
            margin: 0;
            padding: 0;
          }
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        ${formContent ? `
          <div class="form-content">
            ${formContent}
          </div>
        ` : '<p>No form content available.</p>'}
      </body>
    </html>
  `;
};
