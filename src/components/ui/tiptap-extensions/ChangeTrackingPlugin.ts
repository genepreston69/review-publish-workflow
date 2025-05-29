
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Selection } from '@tiptap/pm/state';
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
        
        // If text is being replaced (to > from), handle as replacement
        if (to > from) {
          const deletedText = state.doc.textBetween(from, to);
          if (deletedText.trim()) {
            // This is a replacement operation
            tr.insertText(text, from, to);
            const insertEnd = from + text.length;
            
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

        // Insert the new text with insertion suggestion
        tr.insertText(text, from, to);
        const insertEnd = from + text.length;
        
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
              
              // Mark the selected text as deleted WITHOUT removing it
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

              // Move cursor to the end of the marked text
              tr.setSelection(Selection.near(tr.doc.resolve(to)));

              view.dispatch(tr);
              
              // Prevent the default deletion behavior
              event.preventDefault();
              return true;
            }
          } else {
            // Handle single character deletion
            const pos = selection.from;
            let deleteFrom, deleteTo;
            
            if (event.key === 'Backspace') {
              deleteFrom = Math.max(0, pos - 1);
              deleteTo = pos;
            } else { // Delete key
              deleteFrom = pos;
              deleteTo = Math.min(state.doc.content.size, pos + 1);
            }
            
            if (deleteFrom < deleteTo) {
              const deletedText = state.doc.textBetween(deleteFrom, deleteTo);
              
              if (deletedText.trim()) {
                const { tr } = state;
                
                // Mark the character as deleted WITHOUT removing it
                tr.addMark(
                  deleteFrom,
                  deleteTo,
                  state.schema.marks.suggestion.create({
                    changeId: generateChangeId(),
                    userInitials: options.userInitials,
                    timestamp: new Date().toISOString(),
                    originalText: deletedText,
                    suggestedText: '',
                    changeType: 'delete',
                  })
                );

                // Move cursor to the appropriate position
                const newPos = event.key === 'Backspace' ? deleteFrom : deleteTo;
                tr.setSelection(Selection.near(tr.doc.resolve(newPos)));

                view.dispatch(tr);
                
                // Prevent the default deletion behavior
                event.preventDefault();
                return true;
              }
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
