
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
      
      // Skip if no actual changes
      if (!transactions.some(tr => tr.docChanged)) return null;
      
      // Skip if any transaction is already marked as tracking
      if (transactions.some(tr => tr.getMeta('isTrackingChange'))) return null;
      
      const { schema } = newState;
      const tr = newState.tr;
      let hasChanges = false;
      
      // Check if deletion and addition marks exist
      if (!schema.marks.deletion || !schema.marks.addition) {
        return null;
      }
      
      // Process each transaction that changed the document
      for (const transaction of transactions) {
        if (!transaction.docChanged) continue;
        
        // Analyze steps to determine what changed
        transaction.steps.forEach((step, stepIndex) => {
          const stepType = step.constructor.name;
          console.log('Processing step:', stepType, step);
          
          // Handle text insertion/replacement
          if (stepType === 'ReplaceStep' || stepType === 'ReplaceAroundStep') {
            const stepJson = step.toJSON();
            const from = stepJson.from;
            const to = stepJson.to;
            const slice = stepJson.slice;
            
            // Check if this is a deletion (content removed)
            if (from < to && (!slice || !slice.content || slice.content.length === 0)) {
              // This is a deletion - get the deleted text from old state
              const deletedText = oldState.doc.textBetween(from, to, '\0', '\0');
              if (deletedText) {
                const deletionMark = schema.marks.deletion.create({
                  changeId: uuidv4(),
                  userInitials: options.userInitials,
                  timestamp: new Date().toISOString(),
                  originalText: deletedText,
                });
                
                // Insert the deleted text with deletion mark
                const deletedNode = schema.text(deletedText, [deletionMark]);
                tr.insert(from, deletedNode);
                hasChanges = true;
              }
            }
            
            // Check if this is an insertion (content added)
            if (slice && slice.content && slice.content.length > 0) {
              // Calculate the position where new content was added
              const insertPos = from;
              const insertedText = newState.doc.textBetween(insertPos, insertPos + slice.size, '\0', '\0');
              
              if (insertedText) {
                const additionMark = schema.marks.addition.create({
                  changeId: uuidv4(),
                  userInitials: options.userInitials,
                  timestamp: new Date().toISOString(),
                });
                
                // Apply addition mark to the inserted content
                tr.addMark(insertPos, insertPos + slice.size, additionMark);
                hasChanges = true;
              }
            }
          }
        });
      }
      
      if (hasChanges) {
        // Mark this transaction as a tracking change to prevent infinite recursion
        tr.setMeta('isTrackingChange', true);
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
