
import { Plugin, PluginKey } from 'prosemirror-state';
import { TextSelection } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';

export interface ChangeTrackingOptions {
  userInitials: string;
  enabled: boolean;
}

export const changeTrackingPluginKey = new PluginKey('changeTracking');

export const createChangeTrackingPlugin = (options: ChangeTrackingOptions) =>
  new Plugin({
    key: changeTrackingPluginKey,
    props: {
      handleTextInput(view, from, to, text) {
        if (!options.enabled) return false;

        const { state, dispatch } = view;
        const { tr, schema } = state;
        
        // If text is being replaced (to > from), handle as replacement
        if (to > from) {
          const deletedText = state.doc.textBetween(from, to, '\0', '\0');
          if (deletedText.length > 0) {
            // This is a replacement operation
            // First, mark the existing text as deleted (without removing it)
            const deletionMark = schema.marks.suggestion.create({
              changeId: uuidv4(),
              userInitials: options.userInitials,
              timestamp: new Date().toISOString(),
              originalText: deletedText,
              suggestedText: '',
              changeType: 'delete',
            });

            tr.addMark(from, to, deletionMark);

            // Then insert the new text after the deleted text
            tr.insertText(text, to);
            const insertEnd = to + text.length;
            
            const insertionMark = schema.marks.suggestion.create({
              changeId: uuidv4(),
              userInitials: options.userInitials,
              timestamp: new Date().toISOString(),
              originalText: '',
              suggestedText: text,
              changeType: 'insert',
            });

            tr.addMark(to, insertEnd, insertionMark);
            dispatch(tr);
            return true;
          }
        }

        // Insert the new text with insertion suggestion
        tr.insertText(text, from, to);
        const insertEnd = from + text.length;
        
        const insertionMark = schema.marks.suggestion.create({
          changeId: uuidv4(),
          userInitials: options.userInitials,
          timestamp: new Date().toISOString(),
          originalText: '',
          suggestedText: text,
          changeType: 'insert',
        });

        tr.addMark(from, insertEnd, insertionMark);
        dispatch(tr);
        return true;
      },

      handleKeyDown(view, event) {
        if (!options.enabled) return false;
        if (event.key !== 'Backspace' && event.key !== 'Delete') return false;

        const { state, dispatch } = view;
        const { selection, schema, doc } = state;
        const { from, to, empty } = selection;

        if (!empty && from !== to) {
          // Range selection (can be across multiple nodes)
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
            const deletionMark = schema.marks.suggestion.create({
              userInitials: options.userInitials,
              changeId: uuidv4(),
              timestamp: new Date().toISOString(),
              originalText: deletedText,
              suggestedText: '',
              changeType: 'delete',
            });

            const markedNode = schema.text(deletedText, [deletionMark]);
            let tr = state.tr;
            tr = tr.replaceSelectionWith(markedNode, false);
            const newPos = tr.selection.from + markedNode.nodeSize;
            tr = tr.setSelection(TextSelection.create(tr.doc, newPos));
            dispatch(tr);
            return true;
          }
        }

        // Single-character fallback
        if (empty) {
          let markPos = event.key === 'Backspace' ? from - 1 : from;
          if (markPos < 0 || markPos >= doc.content.size) return false;
          
          const deletedChar = doc.textBetween(markPos, markPos + 1, '\0', '\0');
          if (deletedChar) {
            const deletionMark = schema.marks.suggestion.create({
              userInitials: options.userInitials,
              changeId: uuidv4(),
              timestamp: new Date().toISOString(),
              originalText: deletedChar,
              suggestedText: '',
              changeType: 'delete',
            });

            const markedNode = schema.text(deletedChar, [deletionMark]);
            let tr = state.tr;
            tr = tr.replaceWith(markPos, markPos + 1, markedNode);
            tr = tr.setSelection(TextSelection.create(tr.doc, markPos + 1));
            dispatch(tr);
            return true;
          }
        }

        return false;
      },
    },
  });
