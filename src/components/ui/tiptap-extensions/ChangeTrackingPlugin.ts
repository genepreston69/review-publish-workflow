
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { generateChangeId } from '@/utils/trackingUtils';

export interface ChangeTrackingOptions {
  userInitials: string;
  enabled: boolean;
}

export const changeTrackingPluginKey = new PluginKey('changeTracking');

export function createChangeTrackingPlugin(options: ChangeTrackingOptions) {
  let typingTimeout: NodeJS.Timeout | null = null;
  let lastContentLength = 0;
  let lastCursorPosition = 0;

  return new Plugin({
    key: changeTrackingPluginKey,
    props: {
      handleTextInput(view, from, to, text) {
        if (!options.enabled) return false;

        // Clear any existing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }

        // Set a debounced timeout to apply tracking after user stops typing
        typingTimeout = setTimeout(() => {
          const { state } = view;
          const currentCursorPos = state.selection.from;
          const insertEnd = from + text.length;
          
          // Only mark if this is actually new content (not just cursor movement)
          if (text.trim()) {
            console.log('Applying addition mark from', from, 'to', insertEnd);
            
            const markTr = state.tr.addMark(
              from,
              insertEnd,
              state.schema.marks.addition.create({
                changeId: generateChangeId(),
                userInitials: options.userInitials,
                timestamp: new Date().toISOString(),
              })
            );
            
            view.dispatch(markTr);
          }
        }, 500); // 500ms delay after user stops typing

        // Return false to let TipTap handle the text insertion normally
        return false;
      },

      handleKeyDown(view, event) {
        if (!options.enabled) return false;

        const { state } = view;
        const { selection } = state;

        // Handle deletion keys (Backspace, Delete)
        if (event.key === 'Backspace' || event.key === 'Delete') {
          if (!selection.empty) {
            const { from, to } = selection;
            const deletedText = state.doc.textBetween(from, to);
            
            console.log('Deletion detected:', { from, to, deletedText });
            
            if (deletedText.trim()) {
              const { tr } = state;
              
              // Apply deletion mark to the selected range before deletion
              tr.addMark(
                from,
                to,
                state.schema.marks.deletion.create({
                  changeId: generateChangeId(),
                  userInitials: options.userInitials,
                  timestamp: new Date().toISOString(),
                  originalText: deletedText,
                })
              );

              view.dispatch(tr);
              return true;
            }
          }
        }

        return false;
      },
    },
  });
}

export class ChangeTrackingExtension {
  private editor: any;
  private options: ChangeTrackingOptions;

  constructor(editor: any, options: ChangeTrackingOptions) {
    this.editor = editor;
    this.options = options;
  }

  enable() {
    this.options.enabled = true;
    this.updatePlugin();
  }

  disable() {
    this.options.enabled = false;
    this.updatePlugin();
  }

  setUserInitials(initials: string) {
    this.options.userInitials = initials;
    this.updatePlugin();
  }

  private updatePlugin() {
    const plugin = createChangeTrackingPlugin(this.options);
    this.editor.registerPlugin(plugin);
  }
}
