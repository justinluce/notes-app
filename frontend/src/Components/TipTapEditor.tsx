'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import '../styles/TipTap.css'
import { useEffect } from 'react';
import TipTapMenu from './TipTapMenu';

interface TiptapEditorProps {
  content: string;
  onUpdateContent: (newContent: string) => void;
}

const TipTapEditor = ({ content, onUpdateContent }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      onUpdateContent(newContent);
    },
  });

  // If documentState.content changes externally, update the editor content.
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-container">
      <TipTapMenu editor={editor} />
      <EditorContent id='tip-tap' editor={editor} />
    </div>
  );
};

export default TipTapEditor;
