
export function SuggestionStyles() {
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
    `}</style>
  );
}
