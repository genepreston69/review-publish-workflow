
import { Plugin, PluginKey } from '@tiptap/pm/state';
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
        
        console.log('=== HANDLING TEXT INPUT ===');
        console.log('From:', from, 'To:', to, 'Text:', text);
        
        // If text is being replaced (to > from), handle as replacement
        if (to > from) {
          const deletedText = state.doc.textBetween(from, to);
          console.log('Replacing text:', deletedText, 'with:', text);
          
          if (deletedText.trim()) {
            // Insert the new text first
            tr.insertText(text, from, to);
            const insertEnd = from + text.length;
            
            console.log('Applying replacement mark from', from, 'to', insertEnd);
            
            // Apply suggestion mark to the ENTIRE inserted text range in one operation
            const mark = state.schema.marks.suggestion.create({
              changeId: generateChangeId(),
              userInitials: options.userInitials,
              timestamp: new Date().toISOString(),
              originalText: deletedText,
              suggestedText: text,
              changeType: 'replace',
            });
            
            tr.addMark(from, insertEnd, mark);
            dispatch(tr);
            return true;
          }
        }

        console.log('Inserting new text:', text, 'from', from, 'to', to);
        
        // Insert the new text first
        tr.insertText(text, from, to);
        const insertEnd = from + text.length;
        
        console.log('Applying insertion mark from', from, 'to', insertEnd);
        
        // Apply suggestion mark to the ENTIRE inserted text range in one operation
        const mark = state.schema.marks.suggestion.create({
          changeId: generateChangeId(),
          userInitials: options.userInitials,
          timestamp: new Date().toISOString(),
          originalText: '',
          suggestedText: text,
          changeType: 'insert',
        });
        
        tr.addMark(from, insertEnd, mark);
        dispatch(tr);
        return true;
      },

      handleKeyDown(view, event) {
        if (!options.enabled) return false;

        const { state } = view;
        const { selection } = state;

        console.log('=== HANDLING KEY DOWN ===', event.key);

        // Handle deletion keys (Backspace, Delete)
        if (event.key === 'Backspace' || event.key === 'Delete') {
          if (!selection.empty) {
            const { from, to } = selection;
            const deletedText = state.doc.textBetween(from, to);
            
            console.log('Deleting selected text:', deletedText, 'from', from, 'to', to);
            
            if (deletedText.trim()) {
              const { tr } = state;
              
              console.log('Applying deletion mark from', from, 'to', to);
              
              // Apply suggestion mark to the ENTIRE selected range in one operation
              const mark = state.schema.marks.suggestion.create({
                changeId: generateChangeId(),
                userInitials: options.userInitials,
                timestamp: new Date().toISOString(),
                originalText: deletedText,
                suggestedText: '',
                changeType: 'delete',
              });
              
              tr.addMark(from, to, mark);
              dispatch(tr);
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
  private editor: any;
  private options: ChangeTrackingOptions;

  constructor(editor: any, options: ChangeTrackingOptions) {
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
