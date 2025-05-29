export function EditorStyles() {
  return (
    <style>{`
      /* Suggestion styling */
      .ProseMirror .suggestion-insert {
        font-weight: bold;
        color: #0074D9;
        position: relative;
      }
      
      .ProseMirror .suggestion-delete {
        text-decoration: line-through;
        color: #B22222;
        opacity: 0.8;
        position: relative;
      }
      
      .ProseMirror .suggestion-delete::after {
        content: ' (' attr(data-user-initials) ')';
        font-size: 0.8em;
        color: #888;
        margin-left: 0.25em;
        text-decoration: none;
        font-weight: normal;
      }
      
      .ProseMirror .suggestion-insert::after {
        content: ' (' attr(data-user-initials) ')';
        font-size: 0.8em;
        color: #888;
        margin-left: 0.25em;
        font-weight: normal;
      }
      
      .ProseMirror .suggestion-replace {
        position: relative;
      }
      
      .ProseMirror .suggestion-replace::before {
        content: attr(data-original-text);
        text-decoration: line-through;
        color: #B22222;
        opacity: 0.8;
        margin-right: 2px;
      }
      
      .ProseMirror .suggestion-replace {
        font-weight: bold;
        color: #0074D9;
      }
      
      /* Legacy tracked changes support - keeping for backward compatibility */
      .tracked-addition {
        position: relative;
      }
      
      .tracked-deletion {
        position: relative;
        text-decoration: line-through;
        color: #B22222;
        opacity: 0.8;
      }
      
      .ProseMirror .tracked-addition strong {
        background-color: rgba(34, 139, 34, 0.1);
        padding: 1px 2px;
        border-radius: 2px;
        font-weight: bold;
        color: #0074D9;
      }
      
      .ProseMirror .tracked-deletion s {
        background-color: rgba(178, 34, 34, 0.1);
        padding: 1px 2px;
        border-radius: 2px;
        text-decoration: line-through;
        color: #B22222;
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
          color: #0074D9;
        }
        
        .tracked-deletion s {
          background-color: transparent !important;
          text-decoration: line-through;
          color: #B22222;
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
