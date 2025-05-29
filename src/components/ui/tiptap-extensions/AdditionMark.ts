
import { Mark, mergeAttributes } from '@tiptap/core';

export interface AdditionOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    addition: {
      setAddition: (attributes?: { changeId?: string; userInitials?: string; timestamp?: string }) => ReturnType;
      toggleAddition: (attributes?: { changeId?: string; userInitials?: string; timestamp?: string }) => ReturnType;
      unsetAddition: () => ReturnType;
    };
  }
}

export const Addition = Mark.create<AdditionOptions>({
  name: 'addition',

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
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-change-type="addition"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { userInitials, ...otherAttributes } = HTMLAttributes;
    
    return [
      'span',
      mergeAttributes(
        {
          'data-change-type': 'addition',
          class: 'tracked-addition',
          title: userInitials ? `Added by ${userInitials}` : 'Addition',
        },
        this.options.HTMLAttributes,
        otherAttributes
      ),
      [
        'strong',
        {},
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
      setAddition:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleAddition:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetAddition:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
