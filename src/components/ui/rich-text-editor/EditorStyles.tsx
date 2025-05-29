
export function EditorStyles() {
  return (
    <style>{`
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
      
      @media print {
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
      }
    `}</style>
  );
}
