'use client'

import { Editor, EditorContent } from '@tiptap/react'
import '../styles/TipTap.css'
import TipTapMenu from './TipTapMenu';

interface TiptapEditorProps {
  editor: Editor | null;
}

const TipTapEditor = ({ editor }: TiptapEditorProps) => {

  if (!editor) return null;

  return (
    <div className="tiptap-container">
      <TipTapMenu editor={editor} />
      <EditorContent id='tip-tap' editor={editor} />
    </div>
  );
};

export default TipTapEditor;
