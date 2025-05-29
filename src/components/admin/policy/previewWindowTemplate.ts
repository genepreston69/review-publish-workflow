
export const generatePreviewWindowHTML = (manualContent: string, type: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Policy Manual Preview - ${type}</title>
        <style>
          .preview-controls {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
          }
          .preview-controls button {
            margin: 0 5px;
            padding: 8px 16px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 14px;
          }
          .preview-controls button:hover {
            background: #f3f4f6;
          }
          .preview-controls .print-btn {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }
          .preview-controls .print-btn:hover {
            background: #2563eb;
          }
          .preview-controls .save-btn {
            background: #10b981;
            color: white;
            border-color: #10b981;
          }
          .preview-controls .save-btn:hover {
            background: #059669;
          }
          @media print {
            .preview-controls {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="preview-controls">
          <button onclick="window.print()" class="print-btn">🖨️ Print</button>
          <button onclick="saveAsPDF()" class="save-btn">💾 Save as PDF</button>
          <button onclick="window.close()">✕ Close</button>
        </div>
        ${manualContent.replace('<!DOCTYPE html><html><head>', '').replace('</head><body>', '').replace('</body></html>', '')}
        <script>
          function saveAsPDF() {
            alert('Use your browser\\'s Print dialog and select "Save as PDF" as the destination to save this manual.');
            window.print();
          }
        </script>
      </body>
    </html>
  `;
};
