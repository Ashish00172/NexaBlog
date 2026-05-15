"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Button } from "@/components/ui/button";

const lowlight = createLowlight(common);

type TiptapEditorProps = {
  value: JSONContent;
  onChange: (value: JSONContent) => void;
};

export function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      ImageExtension,
      Youtube.configure({ controls: true, nocookie: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your article content..." })
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap"
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    }
  });

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 p-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          Code
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            const url = window.prompt("Image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          Image
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            const url = window.prompt("YouTube Embed URL");
            if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
          }}
        >
          Video
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

