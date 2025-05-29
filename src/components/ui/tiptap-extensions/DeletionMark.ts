
import { Mark, mergeAttributes } from '@tiptap/core';

export interface DeletionOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deletion: {
      setDeletion: (attributes?: { changeId?: string; userInitials?: string; timestamp?: string; originalText?: string }) => ReturnType;
      toggleDeletion: (attributes?: { changeId?: string; userInitials?: string; timestamp?: string; originalText?: string }) => ReturnType;
      unsetDeletion: () => ReturnType;
    };
  }
}

export const Deletion = Mark.create<DeletionOptions>({
  name: 'deletion',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      changeId: {
        default: null,
        parseHTML: element => element.getAttribute('data-change-id'),
        renderHTML: attributes => {
          if (!attributes.changeId) {
            return {};
          }
          return {
            'data-change-id': attributes.changeId,
          };
        },
      },
      userInitials: {
        default: null,
        parseHTML: element => element.getAttribute('data-user-initials'),
        renderHTML: attributes => {
          if (!attributes.userInitials) {
            return {};
          }
          return {
            'data-user-initials': attributes.userInitials,
          };
        },
      },
      timestamp: {
        default: null,
        parseHTML: element => element.getAttribute('data-timestamp'),
        renderHTML: attributes => {
          if (!attributes.timestamp) {
            return {};
          }
          return {
            'data-timestamp': attributes.timestamp,
          };
        },
      },
      originalText: {
        default: null,
        parseHTML: element => element.getAttribute('data-original-text'),
        renderHTML: attributes => {
          if (!attributes.originalText) {
            return {};
          }
          return {
            'data-original-text': attributes.originalText,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-change-type="deletion"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { userInitials, ...otherAttributes } = HTMLAttributes;
    
    return [
      'span',
      mergeAttributes(
        {
          'data-change-type': 'deletion',
          class: 'tracked-deletion',
          title: userInitials ? `Deleted by ${userInitials}` : 'Deletion',
        },
        this.options.HTMLAttributes,
        otherAttributes
      ),
      [
        's',
        {
          style: 'text-decoration: line-through; color: #666;'
        },
        0, // Content goes here
      ],
      ...(userInitials ? [[
        'sup',
        {
          class: 'tracked-initials',
          style: 'font-size: 0.7em; color: #666; font-weight: normal; margin-left: 2px;'
        },
        `[${userInitials}]`
      ]] : []),
    ];
  },

  addCommands() {
    return {
      setDeletion:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleDeletion:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetDeletion:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
