
export function AIToolbarStyles() {
  return (
    <style>{`
      /* Style for the AI Assistant toolbar to be sticky */
      .ai-toolbar-sticky {
        position: sticky;
        top: 0;
        background: white;
        z-index: 10;
        border-bottom: 1px solid #e5e7eb;
        padding: 12px;
        margin-bottom: 0;
      }

      /* AI Writing Assistant header sticky */
      .ai-writing-assistant-header {
        position: sticky;
        top: 0;
        background: white;
        z-index: 10;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 8px;
      }

      /* Admin controls styling */
      .admin-controls {
        position: sticky;
        bottom: 0;
        background: white;
        border-top: 1px solid #e5e7eb;
        padding: 12px;
        z-index: 10;
      }
    `}</style>
  );
}
