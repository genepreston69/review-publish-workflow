
export function BaseEditorStyles() {
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
    `}</style>
  );
}
