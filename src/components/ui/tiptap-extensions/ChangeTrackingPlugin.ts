
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { generateChangeId } from '@/utils/trackingUtils';

export interface ChangeTrackingOptions {
  userInitials: string;
  enabled: boolean;
}

export const changeTrackingPluginKey = new PluginKey('changeTracking');

export function createChangeTrackingPlugin(options: ChangeTrackingOptions) {
  let lastDocContent = '';
  let isTyping = false;
  let typingTimeout: NodeJS.Timeout | null = null;

  return new Plugin({
    key: changeTrackingPluginKey,
    props: {
      handleKeyDown(view, event) {
        if (!options.enabled) return false;

        const { state } = view;
        const { selection } = state;

        // Handle deletion keys (Backspace, Delete)
        if (event.key === 'Backspace' || event.key === 'Delete') {
          if (!selection.empty) {
            const { from, to } = selection;
            const deletedText = state.doc.textBetween(from, to);
            
            console.log('Deletion detected:', { from, to, deletedText });
            
            if (deletedText.trim()) {
              const { tr } = state;
              
              // Apply deletion mark to the selected range before deletion
              tr.addMark(
                from,
                to,
                state.schema.marks.deletion.create({
                  changeId: generateChangeId(),
                  userInitials: options.userInitials,
                  timestamp: new Date().toISOString(),
                  originalText: deletedText,
                })
              );

              view.dispatch(tr);
              return true;
            }
          }
        }

        // Track when user starts typing
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          if (!isTyping) {
            isTyping = true;
            lastDocContent = state.doc.textContent;
          }
          
          // Clear existing timeout
          if (typingTimeout) {
            clearTimeout(typingTimeout);
          }
          
          // Set timeout to mark additions after user stops typing
          typingTimeout = setTimeout(() => {
            markRecentAdditions(view);
            isTyping = false;
          }, 1000); // 1 second delay after user stops typing
        }

        return false;
      },
    },
  });

  function markRecentAdditions(view: any) {
    if (!options.enabled || !isTyping) return;

    const currentContent = view.state.doc.textContent;
    
    // Only proceed if content actually changed
    if (currentContent === lastDocContent) {
      return;
    }

    // Find where new content was added
    const oldLength = lastDocContent.length;
    const newLength = currentContent.length;
    
    if (newLength > oldLength) {
      // Content was added - find the insertion point
      let insertStart = 0;
      let insertEnd = newLength;
      
      // Find the start of the insertion
      for (let i = 0; i < Math.min(oldLength, newLength); i++) {
        if (lastDocContent[i] !== currentContent[i]) {
          insertStart = i;
          break;
        }
      }
      
      // Find the end of the insertion
      for (let i = 0; i < Math.min(oldLength, newLength); i++) {
        const oldIdx = oldLength - 1 - i;
        const newIdx = newLength - 1 - i;
        if (lastDocContent[oldIdx] !== currentContent[newIdx]) {
          insertEnd = newIdx + 1;
          break;
        }
      }
      
      const addedText = currentContent.substring(insertStart, insertEnd);
      
      if (addedText.trim()) {
        console.log('Marking addition from', insertStart, 'to', insertEnd, 'text:', addedText);
        
        const { tr } = view.state;
        tr.addMark(
          insertStart,
          insertEnd,
          view.state.schema.marks.addition.create({
            changeId: generateChangeId(),
            userInitials: options.userInitials,
            timestamp: new Date().toISOString(),
          })
        );
        
        view.dispatch(tr);
      }
    }
    
    lastDocContent = currentContent;
  }
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
