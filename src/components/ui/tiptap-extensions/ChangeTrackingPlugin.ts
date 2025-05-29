
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

        const { state, dispatch } = view;
        const { tr } = state;
        
        // If text is being replaced (to > from), handle as replacement
        if (to > from) {
          const deletedText = state.doc.textBetween(from, to);
          if (deletedText.trim()) {
            // Insert the new text
            tr.insertText(text, from, to);
            const insertEnd = from + text.length;
            
            // Apply suggestion mark to the entire inserted text range
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

        // Insert the new text
        tr.insertText(text, from, to);
        const insertEnd = from + text.length;
        
        // Apply suggestion mark to the entire inserted text range
        tr.addMark(
          from,
          insertEnd,
          state.schema.marks.suggestion.create({
            changeId: generateChangeId(),
            userInitials: options.userInitials,
            timestamp: new Date().toISOString(),
            originalText: '',
            suggestedText: text,
            changeType: 'insert',
          })
        );

        dispatch(tr);
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
            
            if (deletedText.trim()) {
              const { tr } = state;
              
              // Apply suggestion mark to the entire selected range
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
