

export function EditorStyles() {
  return (
    <style>{`
      /* Edit mode text styling - company blue color with higher specificity */
      .edit-mode-text .ProseMirror {
        color: #2563eb !important;
      }
      
      .edit-mode-text .ProseMirror * {
        color: #2563eb !important;
      }
      
      .edit-mode-text .ProseMirror p,
      .edit-mode-text .ProseMirror div,
      .edit-mode-text .ProseMirror span,
      .edit-mode-text .ProseMirror strong,
      .edit-mode-text .ProseMirror em,
      .edit-mode-text .ProseMirror u,
      .edit-mode-text .ProseMirror li,
      .edit-mode-text .ProseMirror h1,
      .edit-mode-text .ProseMirror h2,
      .edit-mode-text .ProseMirror h3,
      .edit-mode-text .ProseMirror h4,
      .edit-mode-text .ProseMirror h5,
      .edit-mode-text .ProseMirror h6 {
        color: #2563eb !important;
      }
      
      /* Override any prose or other text color classes */
      .edit-mode-text .prose,
      .edit-mode-text .prose * {
        color: #2563eb !important;
      }
      
      /* Draft mode uses default black text (no additional styling needed) */
      
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
      
      /* User initials styling */
      .ProseMirror .suggestion-insert::after,
      .ProseMirror .suggestion-delete::after,
      .ProseMirror .suggestion-replace::after {
        content: " [" attr(data-user-initials) "]";
        font-size: 0.65em;
        color: #888;
        font-weight: normal;
        vertical-align: super;
        margin-left: 1px;
      }
      
      /* Legacy tracked changes support - keeping for backward compatibility */
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

