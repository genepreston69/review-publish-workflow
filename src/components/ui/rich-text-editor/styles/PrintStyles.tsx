
export function PrintStyles() {
  return (
    <style>{`
      @media print {
        .suggestion-insert {
          font-weight: bold !important;
          color: #0074D9 !important;
        }
        
        .suggestion-delete {
          text-decoration: line-through !important;
          color: #B22222 !important;
        }
        
        .suggestion-replace::before {
          text-decoration: line-through !important;
          color: #B22222 !important;
        }
        
        .suggestion-replace {
          font-weight: bold !important;
          color: #0074D9 !important;
        }
        
        /* Legacy support */
        .tracked-addition strong {
          background-color: transparent !important;
          font-weight: bold;
        }
        
        .tracked-deletion s {
          background-color: transparent !important;
          text-decoration: line-through;
        }
        
        .tracked-initials {
          font-size: 0.6em !important;
        }
        
        .ProseMirror ul {
          list-style-type: disc !important;
        }
        
        .ProseMirror ol {
          list-style-type: decimal !important;
        }
        
        /* Edit mode text color for print */
        .edit-mode-text .ProseMirror {
          color: #2563eb !important;
        }
        
        .edit-mode-text .ProseMirror * {
          color: #2563eb !important;
        }
      }
    `}</style>
  );
}
