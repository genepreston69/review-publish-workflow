
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { v4 as uuidv4 } from 'uuid';

export interface ChangeTrackingOptions {
  userInitials: string;
  enabled: boolean;
}

export const changeTrackingPluginKey = new PluginKey('changeTracking');

const createChangeTrackingProseMirrorPlugin = (options: ChangeTrackingOptions) =>
  new Plugin({
    key: changeTrackingPluginKey,
    
    appendTransaction(transactions, oldState, newState) {
      // Only process when tracking is enabled
      if (!options.enabled) return null;
      
      // Skip if this is already a tracking transaction (to avoid infinite loops)
      if (transactions.some(tr => tr.getMeta('isTrackingTransaction'))) {
        return null;
      }
      
      // Skip if no actual content changes occurred
      if (!transactions.some(tr => tr.docChanged)) {
        return null;
      }
      
      const { schema } = newState;
      
      // Check if tracking marks exist in schema
      if (!schema.marks.addition || !schema.marks.deletion) {
        console.warn('Tracking marks not found in schema');
        return null;
      }
      
      let tr = newState.tr;
      let hasChanges = false;
      
      // Process each transaction that changed the document
      for (const transaction of transactions) {
        if (!transaction.docChanged) continue;
        
        // Analyze the steps to detect insertions and deletions
        for (const step of transaction.steps) {
          // Check if this is a replace step using the step's constructor name
          if (step.constructor.name === 'ReplaceStep') {
            const replaceStep = step as any;
            const { from, to, slice } = replaceStep;
            
            // Handle deletions (when content is removed)
            if (from < to && (!slice || slice.size === 0)) {
              const deletedText = oldState.doc.textBetween(from, to, '\0', '\0');
              if (deletedText.trim()) {
                const deletionMark = schema.marks.deletion.create({
                  changeId: uuidv4(),
                  userInitials: options.userInitials,
                  timestamp: new Date().toISOString(),
                  originalText: deletedText,
                });
                
                const markedNode = schema.text(deletedText, [deletionMark]);
                tr = tr.insert(from, markedNode);
                hasChanges = true;
              }
            }
            // Handle insertions (when new content is added)
            else if (slice && slice.size > 0) {
              const insertedText = slice.content.textBetween(0, slice.content.size, '\0', '\0');
              if (insertedText.trim()) {
                const additionMark = schema.marks.addition.create({
                  changeId: uuidv4(),
                  userInitials: options.userInitials,
                  timestamp: new Date().toISOString(),
                });
                
                // Find the inserted content in the new document and mark it
                const insertEnd = from + slice.size;
                tr = tr.addMark(from, insertEnd, additionMark);
                hasChanges = true;
              }
            }
            // Handle replacements (deletion + insertion)
            else if (from < to && slice && slice.size > 0) {
              const deletedText = oldState.doc.textBetween(from, to, '\0', '\0');
              const insertedText = slice.content.textBetween(0, slice.content.size, '\0', '\0');
              
              if (deletedText.trim()) {
                // Mark the deleted text
                const deletionMark = schema.marks.deletion.create({
                  changeId: uuidv4(),
                  userInitials: options.userInitials,
                  timestamp: new Date().toISOString(),
                  originalText: deletedText,
                });
                
                const markedDeletedNode = schema.text(deletedText, [deletionMark]);
                tr = tr.insert(from, markedDeletedNode);
                hasChanges = true;
              }
              
              if (insertedText.trim()) {
                // Mark the inserted text
                const additionMark = schema.marks.addition.create({
                  changeId: uuidv4(),
                  userInitials: options.userInitials,
                  timestamp: new Date().toISOString(),
                });
                
                const insertStart = from + (deletedText.length || 0);
                const insertEnd = insertStart + slice.size;
                tr = tr.addMark(insertStart, insertEnd, additionMark);
                hasChanges = true;
              }
            }
          }
        }
      }
      
      if (hasChanges) {
        // Mark this as a tracking transaction to avoid infinite loops
        tr.setMeta('isTrackingTransaction', true);
        // Don't group with history to maintain proper undo behavior
        tr.setMeta('addToHistory', true);
        return tr;
      }
      
      return null;
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
