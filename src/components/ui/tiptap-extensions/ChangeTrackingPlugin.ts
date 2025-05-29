
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';
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
      
      // Skip undo/redo transactions to avoid interfering with history
      if (transactions.some(tr => tr.getMeta('history$'))) return null;
      
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
          if (step instanceof ReplaceStep) {
            const { from, to, slice } = step;
            
            console.log('Processing ReplaceStep:', { from, to, sliceSize: slice.size });
            
            // Handle deletions (content removed)
            if (from < to && slice.size === 0) {
              // This is a pure deletion
              const deletedText = oldState.doc.textBetween(from, to, '\0', '\0');
              if (deletedText.trim()) {
                console.log('Marking deletion:', deletedText);
                
                const deletionMark = schema.marks.deletion.create({
                  changeId: uuidv4(),
                  userInitials: options.userInitials,
                  timestamp: new Date().toISOString(),
                  originalText: deletedText,
                });
                
                // Insert the deleted text with deletion mark at the deletion point
                const deletedNode = schema.text(deletedText, [deletionMark]);
                tr.insert(from, deletedNode);
                hasChanges = true;
              }
            }
            // Handle insertions (content added)
            else if (slice.size > 0) {
              // Calculate what was actually inserted
              const insertedContent = slice.content;
              let insertPos = from;
              
              // If there was also a deletion (replacement), handle it first
              if (from < to) {
                const deletedText = oldState.doc.textBetween(from, to, '\0', '\0');
                if (deletedText.trim()) {
                  console.log('Marking replacement deletion:', deletedText);
                  
                  const deletionMark = schema.marks.deletion.create({
                    changeId: uuidv4(),
                    userInitials: options.userInitials,
                    timestamp: new Date().toISOString(),
                    originalText: deletedText,
                  });
                  
                  const deletedNode = schema.text(deletedText, [deletionMark]);
                  tr.insert(insertPos, deletedNode);
                  insertPos += deletedNode.nodeSize;
                  hasChanges = true;
                }
              }
              
              // Mark the inserted content with addition marks
              insertedContent.forEach((node, nodeOffset) => {
                if (node.isText && node.text && node.text.trim()) {
                  console.log('Marking addition:', node.text);
                  
                  const additionMark = schema.marks.addition.create({
                    changeId: uuidv4(),
                    userInitials: options.userInitials,
                    timestamp: new Date().toISOString(),
                  });
                  
                  // Calculate the position of the inserted text in the new document
                  const textStart = insertPos + nodeOffset;
                  const textEnd = textStart + node.text.length;
                  
                  // Apply addition mark to the inserted text
                  tr.addMark(textStart, textEnd, additionMark);
                  hasChanges = true;
                }
              });
            }
          }
        });
      }
      
      if (hasChanges) {
        // Mark this transaction as a tracking change to prevent infinite recursion
        tr.setMeta('isTrackingChange', true);
        
        // IMPORTANT: Don't set addToHistory: false
        // Let this transaction be part of the history so undo/redo works properly
        // The tracking marks should be undone together with the original content change
        
        console.log('Returning tracking transaction with changes');
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
