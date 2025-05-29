
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { generateChangeId } from '@/utils/trackingUtils';

export interface ChangeTrackingOptions {
  userInitials: string;
  enabled: boolean;
}

export const changeTrackingPluginKey = new PluginKey('changeTracking');

export function createChangeTrackingPlugin(options: ChangeTrackingOptions) {
  let inputTimer: NodeJS.Timeout | null = null;
  let pendingInput: { from: number; to: number; text: string } | null = null;

  return new Plugin({
    key: changeTrackingPluginKey,
    props: {
      handleTextInput(view, from, to, text) {
        if (!options.enabled) return false;

        console.log('handleTextInput called:', { from, to, text, textLength: text.length });

        // Clear any existing timer
        if (inputTimer) {
          clearTimeout(inputTimer);
        }

        // If we have pending input, merge it with the current input
        if (pendingInput && pendingInput.to === from) {
          // Extend the pending input
          pendingInput.text += text;
          pendingInput.to = from + text.length;
        } else {
          // Start new pending input
          pendingInput = { from, to: from + text.length, text };
        }

        // Set a timer to process the input after a short delay
        inputTimer = setTimeout(() => {
          if (!pendingInput) return;

          const { state, dispatch } = view;
          const { tr } = state;
          
          const finalFrom = pendingInput.from;
          const finalTo = pendingInput.to;
          const finalText = pendingInput.text;

          console.log('Processing batched input:', { finalFrom, finalTo, finalText });

          // Check if this is a replacement (original to > from)
          if (to > from) {
            const deletedText = state.doc.textBetween(from, to);
            console.log('Replacement detected:', { deletedText, newText: finalText });
            
            if (deletedText.trim()) {
              // Insert the new text
              tr.insertText(finalText, from, to);
              const insertEnd = from + finalText.length;
              
              console.log('Applying replacement mark from', from, 'to', insertEnd);
              
              // Apply suggestion mark to the ENTIRE inserted text range
              tr.addMark(
                from,
                insertEnd,
                state.schema.marks.suggestion.create({
                  changeId: generateChangeId(),
                  userInitials: options.userInitials,
                  timestamp: new Date().toISOString(),
                  originalText: deletedText,
                  suggestedText: finalText,
                  changeType: 'replace',
                })
              );

              dispatch(tr);
              pendingInput = null;
              return;
            }
          }

          console.log('Insert detected, applying mark from', finalFrom, 'to', finalTo);

          // Apply suggestion mark to the ENTIRE inserted text range
          tr.addMark(
            finalFrom,
            finalTo,
            state.schema.marks.suggestion.create({
              changeId: generateChangeId(),
              userInitials: options.userInitials,
              timestamp: new Date().toISOString(),
              originalText: '',
              suggestedText: finalText,
              changeType: 'insert',
            })
          );

          dispatch(tr);
          pendingInput = null;
        }, 100); // 100ms delay to batch rapid inputs

        // Always return true to prevent default handling
        return true;
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
              
              // Apply suggestion mark to the ENTIRE selected range
              tr.addMark(
                from,
                to,
                state.schema.marks.suggestion.create({
                  changeId: generateChangeId(),
                  userInitials: options.userInitials,
                  timestamp: new Date().toISOString(),
                  originalText: deletedText,
                  suggestedText: '',
                  changeType: 'delete',
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
