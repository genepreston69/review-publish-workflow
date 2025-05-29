
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { TextSelection } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';

export interface ChangeTrackingOptions {
  userInitials: string;
  enabled: boolean;
}

export const changeTrackingPluginKey = new PluginKey('changeTracking');

const createChangeTrackingProseMirrorPlugin = (options: ChangeTrackingOptions) =>
  new Plugin({
    key: changeTrackingPluginKey,
    props: {
      handleTextInput(view, from, to, text) {
        // Only intercept when tracking is enabled
        if (!options.enabled) return false;

        const { state, dispatch } = view;
        const { tr, schema } = state;
        
        // Check if deletion mark exists in schema
        if (!schema.marks.deletion) {
          console.warn('Deletion mark not found in schema');
          return false;
        }

        // Check if addition mark exists in schema  
        if (!schema.marks.addition) {
          console.warn('Addition mark not found in schema');
          return false;
        }
        
        // Create a transaction
        let transaction = tr;
        
        // If text is being replaced (to > from), handle as replacement
        if (to > from) {
          const deletedText = state.doc.textBetween(from, to, '\0', '\0');
          if (deletedText.length > 0) {
            // Mark existing text as deleted using the deletion mark
            const deletionMark = schema.marks.deletion.create({
              changeId: uuidv4(),
              userInitials: options.userInitials,
              timestamp: new Date().toISOString(),
              originalText: deletedText,
            });

            transaction = transaction.addMark(from, to, deletionMark);

            // Then insert the new text after the deleted text
            transaction = transaction.insertText(text, to);
            const insertEnd = to + text.length;
            
            const additionMark = schema.marks.addition.create({
              changeId: uuidv4(),
              userInitials: options.userInitials,
              timestamp: new Date().toISOString(),
            });

            transaction = transaction.addMark(to, insertEnd, additionMark);
            
            dispatch(transaction);
            return true;
          }
        }

        // Insert the new text with addition mark
        transaction = transaction.insertText(text, from, to);
        const insertEnd = from + text.length;
        
        const additionMark = schema.marks.addition.create({
          changeId: uuidv4(),
          userInitials: options.userInitials,
          timestamp: new Date().toISOString(),
        });

        transaction = transaction.addMark(from, insertEnd, additionMark);
        
        dispatch(transaction);
        return true;
      },

      handleKeyDown(view, event) {
        // Only intercept when tracking is enabled
        if (!options.enabled) return false;
        
        // IMPORTANT: Don't intercept undo/redo shortcuts at all when tracking is enabled
        if ((event.ctrlKey || event.metaKey) && (event.key === 'z' || event.key === 'y')) {
          return false;
        }
        
        if (event.key !== 'Backspace' && event.key !== 'Delete') return false;

        const { state, dispatch } = view;
        const { selection, schema, doc } = state;
        const { from, to, empty } = selection;

        // Check if deletion mark exists in schema
        if (!schema.marks.deletion) {
          console.warn('Deletion mark not found in schema');
          return false;
        }

        let transaction = state.tr;

        if (!empty && from !== to) {
          // Range selection - get the actual text
          let deletedText = '';
          doc.nodesBetween(from, to, (node, pos) => {
            if (node.isText) {
              const start = Math.max(from, pos);
              const end = Math.min(to, pos + node.nodeSize - 2);
              deletedText += node.text?.slice(start - pos, end - pos) || '';
            } else if (node.isLeaf && node.isInline) {
              deletedText += node.textContent;
            }
          });

          if (deletedText) {
            const deletionMark = schema.marks.deletion.create({
              userInitials: options.userInitials,
              changeId: uuidv4(),
              timestamp: new Date().toISOString(),
              originalText: deletedText,
            });

            const markedNode = schema.text(deletedText, [deletionMark]);
            transaction = transaction.replaceSelectionWith(markedNode, false);
            const newPos = transaction.selection.from + markedNode.nodeSize;
            
            // Ensure position is valid before creating selection
            if (newPos <= transaction.doc.content.size) {
              transaction = transaction.setSelection(TextSelection.create(transaction.doc, newPos));
            }
            
            dispatch(transaction);
            return true;
          }
        }

        // Single-character fallback
        if (empty) {
          let markPos = event.key === 'Backspace' ? from - 1 : from;
          if (markPos < 0 || markPos >= doc.content.size) return false;
          
          const deletedChar = doc.textBetween(markPos, markPos + 1, '\0', '\0');
          if (deletedChar) {
            const deletionMark = schema.marks.deletion.create({
              userInitials: options.userInitials,
              changeId: uuidv4(),
              timestamp: new Date().toISOString(),
              originalText: deletedChar,
            });

            const markedNode = schema.text(deletedChar, [deletionMark]);
            transaction = transaction.replaceWith(markPos, markPos + 1, markedNode);
            
            // Ensure position is valid before creating selection
            const newPos = markPos + 1;
            if (newPos <= transaction.doc.content.size) {
              transaction = transaction.setSelection(TextSelection.create(transaction.doc, newPos));
            }
            
            dispatch(transaction);
            return true;
          }
        }

        return false;
      },
    },
  });

export const ChangeTrackingExtension = Extension.create<ChangeTrackingOptions>({
  name: 'changeTracking',

  addOptions() {
    return {
      userInitials: 'U',
      enabled: false,
    };
  },

  addProseMirrorPlugins() {
    return [
      createChangeTrackingProseMirrorPlugin(this.options),
    ];
  },
});
