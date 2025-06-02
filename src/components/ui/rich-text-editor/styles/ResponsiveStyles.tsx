
export function ResponsiveStyles() {
  return (
    <style>{`
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .ProseMirror {
          padding: 12px !important;
          max-height: 60vh;
        }
        
        .ai-toolbar-sticky {
          padding: 8px;
        }
      }
    `}</style>
  );
}
