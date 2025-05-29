
import { Mark, mergeAttributes } from '@tiptap/core';

export interface SuggestionAttributes {
  changeId: string;
  userInitials: string;
  originalText?: string;
  suggestedText?: string;
  timestamp: string;
  changeType: 'insert' | 'delete' | 'replace';
}

export interface SuggestionOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    suggestion: {
      setSuggestion: (attributes: SuggestionAttributes) => ReturnType;
      unsetSuggestion: () => ReturnType;
    };
  }
}

export const Suggestion = Mark.create<SuggestionOptions, SuggestionAttributes>({
  name: 'suggestion',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      changeId: {
        default: '',
      },
      userInitials: {
        default: '',
      },
      originalText: {
        default: '',
      },
      suggestedText: {
        default: '',
      },
      timestamp: {
        default: '',
      },
      changeType: {
        default: 'insert',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-suggestion]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            changeId: el.getAttribute('data-change-id'),
            userInitials: el.getAttribute('data-user-initials'),
            originalText: el.getAttribute('data-original-text'),
            suggestedText: el.getAttribute('data-suggested-text'),
            timestamp: el.getAttribute('data-timestamp'),
            changeType: el.getAttribute('data-change-type'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, mark }) {
    const attrs = mark.attrs as SuggestionAttributes;
    
    // Base class for styling
    let baseClass = `suggestion-${attrs.changeType}`;
    
    // Add specific styling based on change type
    if (attrs.changeType === 'insert') {
      baseClass += ' font-bold text-green-700 bg-green-50';
    } else if (attrs.changeType === 'delete') {
      baseClass += ' line-through text-red-700 bg-red-50';
    } else if (attrs.changeType === 'replace') {
      baseClass += ' font-bold text-blue-700 bg-blue-50';
    }
    
    return [
      'span',
      mergeAttributes(
        {
          'data-suggestion': 'true',
          'data-change-id': attrs.changeId,
          'data-user-initials': attrs.userInitials,
          'data-original-text': attrs.originalText || '',
          'data-suggested-text': attrs.suggestedText || '',
          'data-timestamp': attrs.timestamp,
          'data-change-type': attrs.changeType,
          class: baseClass,
          title: `${attrs.changeType} by ${attrs.userInitials}`,
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      0,
    ];
  },

  addCommands() {
    return {
      setSuggestion:
        (attributes: SuggestionAttributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetSuggestion:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
