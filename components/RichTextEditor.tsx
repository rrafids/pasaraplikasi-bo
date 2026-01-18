'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  BoldIcon as Bold,
  ItalicIcon as Italic,
  ListBulletIcon as ListBullet,
} from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = 'Enter description...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-ol:my-2',
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-300 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-slate-200 px-3 py-2 bg-slate-50 rounded-t-lg">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('bold') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('italic') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-xs font-semibold hover:bg-slate-200 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-xs font-semibold hover:bg-slate-200 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded text-xs font-semibold hover:bg-slate-200 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'
          }`}
          title="Heading 3"
        >
          H3
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'
          }`}
          title="Bullet List"
        >
          <ListBullet className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-xs font-semibold hover:bg-slate-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'
          }`}
          title="Numbered List"
        >
          1.
        </button>
      </div>
      
      {/* Editor Content */}
      <div className="rounded-b-lg overflow-y-auto max-h-[400px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
