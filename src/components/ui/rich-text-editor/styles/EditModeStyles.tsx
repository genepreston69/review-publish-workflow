
export function EditModeStyles() {
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
    `}</style>
  );
}
