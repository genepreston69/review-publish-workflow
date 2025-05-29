
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { v4 as uuidv4 } from 'uuid';

export interface ChangeTrackingOptions {
  userInitials: string;
  enabled: boolean;
}

export const changeTrackingPluginKey = new PluginKey('changeTracking');

interface Change {
  type: 'insert' | 'delete' | 'replace';
  from: number;
  to: number;
  content?: string;
  deletedContent?: string;
}

// Helper function to find text differences between two documents
const findDocumentChanges = (oldDoc: ProseMirrorNode, newDoc: ProseMirrorNode): Change[] => {
  const changes: Change[] = [];
  
  // Simple approach: compare the entire text content
  const oldText = oldDoc.textContent;
  const newText = newDoc.textContent;
  
  if (oldText === newText) return changes;
  
  // Find the first and last positions where text differs
  let start = 0;
  while (start < Math.min(oldText.length, newText.length) && oldText[start] === newText[start]) {
    start++;
  }
  
  let oldEnd = oldText.length;
  let newEnd = newText.length;
  while (oldEnd > start && newEnd > start && oldText[oldEnd - 1] === newText[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  
  // Determine change type and create change object
  const deletedText = oldText.slice(start, oldEnd);
  const insertedText = newText.slice(start, newEnd);
  
  if (deletedText && insertedText) {
    // Replacement
    changes.push({
      type: 'replace',
      from: start,
      to: start + deletedText.length,
      content: insertedText,
      deletedContent: deletedText,
    });
  } else if (deletedText) {
    // Deletion
    changes.push({
      type: 'delete',
      from: start,
      to: start + deletedText.length,
      deletedContent: deletedText,
    });
  } else if (insertedText) {
    // Insertion
    changes.push({
      type: 'insert',
      from: start,
      to: start,
      content: insertedText,
    });
  }
  
  return changes;
};

// Helper function to find the actual position in the new document
const findPositionInNewDoc = (newDoc: ProseMirrorNode, textPosition: number): number => {
  let pos = 0;
  let textPos = 0;
  
  newDoc.descendants((node, nodePos) => {
    if (node.isText) {
      const nodeText = node.text || '';
      if (textPos + nodeText.length >= textPosition) {
        pos = nodePos + (textPosition - textPos);
        return false; // Stop iteration
      }
      textPos += nodeText.length;
    }
    return true;
  });
  
  return Math.max(1, pos); // Ensure position is at least 1
};

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
      
      // Check if deletion and addition marks exist
      if (!schema.marks.deletion || !schema.marks.addition) {
        return null;
      }
      
      // Find what changed by comparing documents
      const changes = findDocumentChanges(oldState.doc, newState.doc);
      
      if (changes.length === 0) return null;
      
      console.log('Document changes detected:', changes);
      
      const tr = newState.tr;
      let hasChanges = false;
      
      // Process each change atomically
      changes.forEach((change) => {
        const changeId = uuidv4();
        const timestamp = new Date().toISOString();
        
        if (change.type === 'insert' && change.content) {
          // Handle insertion - apply addition mark to the inserted content
          const startPos = findPositionInNewDoc(newState.doc, change.from);
          const endPos = startPos + change.content.length;
          
          console.log('Marking insertion:', { content: change.content, startPos, endPos });
          
          const additionMark = schema.marks.addition.create({
            changeId,
            userInitials: options.userInitials,
            timestamp,
          });
          
          tr.addMark(startPos, endPos, additionMark);
          hasChanges = true;
          
        } else if (change.type === 'delete' && change.deletedContent) {
          // Handle deletion - insert the deleted text with deletion mark
          const insertPos = findPositionInNewDoc(newState.doc, change.from);
          
          console.log('Marking deletion:', { content: change.deletedContent, insertPos });
          
          const deletionMark = schema.marks.deletion.create({
            changeId,
            userInitials: options.userInitials,
            timestamp,
            originalText: change.deletedContent,
          });
          
          const deletedNode = schema.text(change.deletedContent, [deletionMark]);
          tr.insert(insertPos, deletedNode);
          hasChanges = true;
          
        } else if (change.type === 'replace' && change.content && change.deletedContent) {
          // Handle replacement - insert deletion mark then apply addition mark
          const insertPos = findPositionInNewDoc(newState.doc, change.from);
          
          console.log('Marking replacement:', { 
            deleted: change.deletedContent, 
            inserted: change.content,
            insertPos 
          });
          
          // First, insert the deleted text with deletion mark
          const deletionMark = schema.marks.deletion.create({
            changeId: uuidv4(),
            userInitials: options.userInitials,
            timestamp,
            originalText: change.deletedContent,
          });
          
          const deletedNode = schema.text(change.deletedContent, [deletionMark]);
          tr.insert(insertPos, deletedNode);
          
          // Then, apply addition mark to the replacement text
          const replacementStartPos = insertPos + deletedNode.nodeSize;
          const replacementEndPos = replacementStartPos + change.content.length;
          
          const additionMark = schema.marks.addition.create({
            changeId,
            userInitials: options.userInitials,
            timestamp,
          });
          
          tr.addMark(replacementStartPos, replacementEndPos, additionMark);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        // Mark this transaction as a tracking change to prevent infinite recursion
        tr.setMeta('isTrackingChange', true);
        
        // Let this transaction be part of the history so undo/redo works properly
        // The tracking marks will be undone together with the original content change
        
        console.log('Returning atomic tracking transaction');
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
