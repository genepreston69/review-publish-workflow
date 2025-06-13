
export function FullscreenStyles() {
  return (
    <style>{`
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

      /* Responsive full width */
      @media (min-width: 640px) {
        .ProseMirror {
          width: 100% !important;
          max-width: none !important;
        }
      }

      @media (min-width: 768px) {
        .ProseMirror {
          width: 100% !important;
          max-width: none !important;
        }
      }

      @media (min-width: 1024px) {
        .ProseMirror {
          width: 100% !important;
          max-width: none !important;
        }
      }
    `}</style>
  );
}
