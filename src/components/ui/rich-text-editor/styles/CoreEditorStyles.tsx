
export function CoreEditorStyles() {
  return (
    <style>{`
      /* CSS fixes for editor width and height issues */
      
      /* Make editor container full width */
      .editor-container {
        width: 100%;
        max-width: none;
      }

      /* Full width editor content */
      .ProseMirror {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 16px !important;
        min-height: 300px;
        max-height: 60vh; /* This makes it scrollable */
        overflow-y: auto;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        line-height: 1.8;
        white-space: pre-wrap;
      }

      /* Remove prose width constraints */
      .prose, .prose-sm, .prose-lg {
        max-width: none !important;
        width: 100% !important;
      }

      /* Remove prose classes that limit width */
      .ProseMirror.prose {
        max-width: none !important;
      }

      /* Full width for the TipTap editor wrapper */
      .tiptap {
        width: 100% !important;
        max-width: none !important;
      }

      /* Ensure parent containers are full width */
      .editor-wrapper,
      .content-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Optional: Full screen editor mode */
      .editor-fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 50;
        background: white;
        padding: 20px;
        overflow-y: auto;
      }

      .editor-fullscreen .ProseMirror {
        max-height: calc(100vh - 200px);
        min-height: calc(100vh - 200px);
      }

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
