
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { generateChangeId } from '@/utils/trackingUtils';

export interface ChangeTrackingOptions {
  userInitials: string;
  enabled: boolean;
}

export const changeTrackingPluginKey = new PluginKey('changeTracking');

export function createChangeTrackingPlugin(options: ChangeTrackingOptions) {
  return new Plugin({
    key: changeTrackingPluginKey,
    props: {
      handleTextInput(view, from, to, text) {
        if (!options.enabled) return false;

        console.log('handleTextInput called:', { from, to, text, textLength: text.length });

        const { state, dispatch } = view;
        const { tr } = state;
        
        // Check if this is a replacement (original to > from)
        if (to > from) {
          const deletedText = state.doc.textBetween(from, to);
          console.log('Replacement detected:', { deletedText, newText: text });
          
          if (deletedText.trim()) {
            // Insert the new text
            tr.insertText(text, from, to);
            const insertEnd = from + text.length;
            
            console.log('Applying replacement mark from', from, 'to', insertEnd);
            
            // Apply suggestion mark to the inserted text
            tr.addMark(
              from,
              insertEnd,
              state.schema.marks.suggestion.create({
                changeId: generateChangeId(),
                userInitials: options.userInitials,
                timestamp: new Date().toISOString(),
                originalText: deletedText,
                suggestedText: text,
                changeType: 'replace',
              })
            );

            dispatch(tr);
            return true;
          }
        }

        // For regular insertions, let TipTap handle it normally
        // We'll apply marks in a separate transaction after the text is inserted
        setTimeout(() => {
          const currentState = view.state;
          const insertEnd = from + text.length;
          
          console.log('Applying insert mark from', from, 'to', insertEnd);
          
          const markTr = currentState.tr.addMark(
            from,
            insertEnd,
            currentState.schema.marks.suggestion.create({
              changeId: generateChangeId(),
              userInitials: options.userInitials,
              timestamp: new Date().toISOString(),
              originalText: '',
              suggestedText: text,
              changeType: 'insert',
            })
          );
          
          view.dispatch(markTr);
        }, 0);

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
              
              // Apply suggestion mark to the selected range before deletion
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
