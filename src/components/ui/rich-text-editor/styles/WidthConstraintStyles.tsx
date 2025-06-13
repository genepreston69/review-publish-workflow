
export function WidthConstraintStyles() {
  return (
    <style>{`
      /* Remove prose width constraints */
      .prose, .prose-sm, .prose-lg {
        max-width: none !important;
        width: 100% !important;
      }

      /* Remove prose classes that limit width */
      .ProseMirror.prose {
        max-width: none !important;
      }

      /* Force full width for TipTap editor - comprehensive rules */

      /* Target the editor container and all parent elements */
      .tiptap-editor-container,
      .editor-wrapper,
      .ProseMirror-wrapper {
        width: 100% !important;
        max-width: none !important;
        display: block !important;
      }

      /* Force the actual ProseMirror editor to full width */
      .ProseMirror {
        min-width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        box-sizing: border-box !important;
      }

      /* Remove any prose class width constraints */
      .ProseMirror.prose,
      .ProseMirror.prose-sm,
      .ProseMirror.prose-lg,
      .ProseMirror.prose-xl,
      .ProseMirror.prose-2xl {
        max-width: none !important;
        width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }

      /* Target the TipTap React wrapper */
      .tiptap {
        display: block !important;
      }

      /* Force EditorContent wrapper to full width */
      .ProseMirror-focused,
      .ProseMirror-unfocused {
        width: 100% !important;
        max-width: none !important;
      }

      /* Remove any container width constraints */
      [class*="prose"] {
        max-width: none !important;
        width: 100% !important;
      }

      /* Target your specific form field wrapper if it has width constraints */
      .form-field-wrapper,
      .editor-field,
      .rich-text-editor {
        width: 100% !important;
        max-width: none !important;
        flex: 1 !important;
      }

      /* If you're using a grid or flex layout, force the editor column to expand */
      .policy-form-grid,
      .form-grid,
      .editor-grid-item {
        width: 100% !important;
        max-width: none !important;
        flex: 1 !important;
        grid-column: 1 / -1 !important; /* Takes full width in CSS Grid */
      }

      /* Target any container that might be limiting width */
      .content-area,
      .main-content,
      .form-content {
        width: 100% !important;
        max-width: none !important;
      }
    `}</style>
  );
}
