
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';

export const getEditorExtensions = () => [
  StarterKit.configure({
    // Disable the default list extensions from StarterKit
    bulletList: false,
    orderedList: false,
    listItem: false,
  }),
  // Add the list extensions separately with proper configuration
  BulletList.configure({
    HTMLAttributes: {
      class: 'bullet-list',
    },
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: 'ordered-list',
    },
  }),
  ListItem.configure({
    HTMLAttributes: {
      class: 'list-item',
    },
  }),
  TextStyle,
  Color,
  Underline,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
];

export const getEditorProps = () => ({
  attributes: {
    class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 leading-relaxed',
    style: 'line-height: 1.8;',
  },
});
