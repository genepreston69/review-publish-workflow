
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
  type: 'insert' | 'delete';
  from: number;
  to: number;
  content?: string;
  deletedContent?: string;
}

// Helper function to find text differences between two documents
const findDocumentChanges = (oldDoc: ProseMirrorNode, newDoc: ProseMirrorNode): Change[] => {
  const changes: Change[] = [];
  
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
  
  // Determine change type
  const deletedText = oldText.slice(start, oldEnd);
  const insertedText = newText.slice(start, newEnd);
  
  if (insertedText && !deletedText) {
    // Pure insertion
    changes.push({
      type: 'insert',
      from: start,
      to: start + insertedText.length,
      content: insertedText,
    });
  } else if (deletedText && !insertedText) {
    // Pure deletion - store metadata only, don't re-insert
    changes.push({
      type: 'delete',
      from: start,
      to: start,
      deletedContent: deletedText,
    });
  } else if (deletedText && insertedText) {
    // Replacement - treat as deletion (metadata) + insertion (marked)
    changes.push({
      type: 'delete',
      from: start,
      to: start,
      deletedContent: deletedText,
    });
    changes.push({
      type: 'insert',
      from: start,
      to: start + insertedText.length,
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
  
  return Math.max(1, pos);
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
      
      // Check if addition mark exists
      if (!schema.marks.addition) {
        return null;
      }
      
      // Find what changed by comparing documents
      const changes = findDocumentChanges(oldState.doc, newState.doc);
      
      if (changes.length === 0) return null;
      
      console.log('Document changes detected:', changes);
      
      const tr = newState.tr;
      let hasChanges = false;
      
      // Process each change - ONLY ADD MARKS, NO STRUCTURAL CHANGES
      changes.forEach((change) => {
        const changeId = uuidv4();
        const timestamp = new Date().toISOString();
        
        if (change.type === 'insert' && change.content) {
          // Handle insertion - apply addition mark to the inserted content
          const startPos = findPositionInNewDoc(newState.doc, change.from);
          const endPos = startPos + change.content.length;
          
          // Ensure positions are valid
          if (startPos >= 1 && endPos <= newState.doc.content.size && startPos < endPos) {
            console.log('Marking insertion:', { content: change.content, startPos, endPos });
            
            const additionMark = schema.marks.addition.create({
              changeId,
              userInitials: options.userInitials,
              timestamp,
            });
            
            tr.addMark(startPos, endPos, additionMark);
            hasChanges = true;
          }
          
        } else if (change.type === 'delete' && change.deletedContent) {
          // Handle deletion - DO NOT re-insert text, only log metadata
          console.log('Deletion detected (metadata only):', { 
            content: change.deletedContent, 
            position: change.from,
            changeId,
            userInitials: options.userInitials,
            timestamp 
          });
          
          // Store deletion metadata for future use (could be used for side panel, etc.)
          // For now, we just log it - no structural changes to the document
          
          // TODO: Could store in plugin state for retrieval by UI components
          // TODO: Could add deletion marks to adjacent content as visual indicators
        }
      });
      
      if (hasChanges) {
        // Mark this transaction as a tracking change to prevent infinite recursion
        tr.setMeta('isTrackingChange', true);
        
        console.log('Returning mark-only tracking transaction');
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
