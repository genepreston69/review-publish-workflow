
export function EditorStyles() {
  return (
    <style>{`
      .tracked-addition {
        position: relative;
      }
      
      .tracked-deletion {
        position: relative;
      }
      
      .tracked-initials {
        pointer-events: none;
        user-select: none;
      }
      
      .ProseMirror .tracked-addition strong {
        background-color: rgba(34, 139, 34, 0.1);
        padding: 1px 2px;
        border-radius: 2px;
      }
      
      .ProseMirror .tracked-deletion s {
        background-color: rgba(178, 34, 34, 0.1);
        padding: 1px 2px;
        border-radius: 2px;
      }
      
      /* Fix bullet list styling */
      .ProseMirror ul {
        list-style-type: disc !important;
        margin-left: 0 !important;
        padding-left: 1.5rem !important;
      }
      
      .ProseMirror ol {
        list-style-type: decimal !important;
        margin-left: 0 !important;
        padding-left: 1.5rem !important;
      }
      
      .ProseMirror li {
        display: list-item !important;
        margin: 0.25rem 0 !important;
        padding-left: 0 !important;
      }
      
      .ProseMirror li p {
        margin: 0 !important;
        display: inline !important;
      }
      
      /* Override prose styles that might hide bullets */
      .prose ul {
        list-style-type: disc !important;
        padding-left: 1.5rem !important;
      }
      
      .prose ol {
        list-style-type: decimal !important;
        padding-left: 1.5rem !important;
      }
      
      .prose li {
        display: list-item !important;
        margin: 0.25rem 0 !important;
      }
      
      .prose li::marker {
        color: inherit !important;
      }
      
      /* Nested lists */
      .ProseMirror ul ul {
        list-style-type: circle !important;
        margin-top: 0.25rem !important;
        margin-bottom: 0.25rem !important;
      }
      
      .ProseMirror ul ul ul {
        list-style-type: square !important;
      }
      
      @media print {
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
      }
    `}</style>
  );
}
