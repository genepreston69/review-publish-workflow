
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Editor } from '@tiptap/react';
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
        
        // If text is being replaced (to > from), mark the old text as deleted
        if (to > from) {
          const deletedText = state.doc.textBetween(from, to);
          if (deletedText.trim()) {
            // Apply deletion mark to the existing text
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
          }
        }

        // Insert the new text with addition mark
        tr.insertText(text, from, to);
        const insertEnd = from + text.length;
        
        tr.addMark(
          from,
          insertEnd,
          state.schema.marks.addition.create({
            changeId: generateChangeId(),
            userInitials: options.userInitials,
            timestamp: new Date().toISOString(),
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
              
              // Mark the selected text as deleted instead of removing it
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
  private editor: Editor;
  private options: ChangeTrackingOptions;

  constructor(editor: Editor, options: ChangeTrackingOptions) {
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
