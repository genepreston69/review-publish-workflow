
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { v4 as uuidv4 } from 'uuid';

export interface ChangeTrackingOptions {
  userInitials: string;
  enabled: boolean;
}

export const changeTrackingPluginKey = new PluginKey('changeTracking');

// Helper to check if a step is an insertion
const isInsertStep = (step: Step): boolean => {
  return step.jsonID === 'replace' && (step as any).slice?.size > 0;
};

// Helper to check if a step is a deletion
const isDeletionStep = (step: Step): boolean => {
  return step.jsonID === 'replace' && (step as any).slice?.size === 0 && (step as any).to > (step as any).from;
};

// Helper to get step details
const getStepDetails = (step: Step) => {
  const stepData = step as any;
  return {
    from: stepData.from || 0,
    to: stepData.to || 0,
    slice: stepData.slice,
  };
};

const createChangeTrackingProseMirrorPlugin = (options: ChangeTrackingOptions) =>
  new Plugin({
    key: changeTrackingPluginKey,
    
    state: {
      init() {
        return {
          pendingMarks: new Map(),
          lastGroupTime: 0,
        };
      },
      apply(tr, state) {
        // Clear pending marks if this is a tracking transaction
        if (tr.getMeta('isTrackingChange')) {
          return {
            ...state,
            pendingMarks: new Map(),
          };
        }
        
        // Group rapid typing by time
        const now = Date.now();
        const isGrouped = now - state.lastGroupTime < 500; // 500ms grouping window
        
        return {
          ...state,
          lastGroupTime: isGrouped ? state.lastGroupTime : now,
        };
      },
    },
    
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
      
      const tr = newState.tr;
      let hasChanges = false;
      
      // Process each transaction's steps
      for (const transaction of transactions) {
        if (!transaction.steps.length) continue;
        
        // Group consecutive steps by type and position
        const stepGroups: { steps: Step[]; type: 'insert' | 'delete' | 'other' }[] = [];
        let currentGroup: { steps: Step[]; type: 'insert' | 'delete' | 'other' } | null = null;
        
        for (const step of transaction.steps) {
          let stepType: 'insert' | 'delete' | 'other' = 'other';
          
          if (isInsertStep(step)) {
            stepType = 'insert';
          } else if (isDeletionStep(step)) {
            stepType = 'delete';
          }
          
          if (!currentGroup || currentGroup.type !== stepType) {
            currentGroup = { steps: [step], type: stepType };
            stepGroups.push(currentGroup);
          } else {
            currentGroup.steps.push(step);
          }
        }
        
        // Process each group
        for (const group of stepGroups) {
          if (group.type === 'insert') {
            // Handle insertions - apply addition mark to the inserted content
            const changeId = uuidv4();
            const timestamp = new Date().toISOString();
            
            // Calculate the range for all insertions in this group
            let groupFrom = Infinity;
            let groupTo = 0;
            let totalInsertedLength = 0;
            
            for (const step of group.steps) {
              const details = getStepDetails(step);
              groupFrom = Math.min(groupFrom, details.from);
              if (details.slice && details.slice.content) {
                totalInsertedLength += details.slice.content.size;
              }
            }
            
            groupTo = groupFrom + totalInsertedLength;
            
            // Ensure positions are valid in the new document
            if (groupFrom >= 1 && groupTo <= newState.doc.content.size && groupFrom < groupTo) {
              console.log('Marking insertion group:', { 
                from: groupFrom, 
                to: groupTo, 
                length: totalInsertedLength,
                changeId 
              });
              
              const additionMark = schema.marks.addition.create({
                changeId,
                userInitials: options.userInitials,
                timestamp,
              });
              
              tr.addMark(groupFrom, groupTo, additionMark);
              hasChanges = true;
            }
            
          } else if (group.type === 'delete') {
            // Handle deletions - track metadata only, no re-insertion
            const changeId = uuidv4();
            const timestamp = new Date().toISOString();
            
            for (const step of group.steps) {
              const details = getStepDetails(step);
              const deletedLength = details.to - details.from;
              
              console.log('Deletion detected (metadata only):', { 
                from: details.from,
                to: details.to,
                deletedLength,
                changeId,
                userInitials: options.userInitials,
                timestamp 
              });
              
              // Store deletion metadata for future use
              // Could be used for side panel, comments, etc.
              // For now, we just log it - no structural changes to the document
            }
          }
        }
      }
      
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
