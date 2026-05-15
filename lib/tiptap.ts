import type { JSONContent } from "@tiptap/core";

const fallbackContent: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }]
};

export function toEditorContent(value: unknown): JSONContent {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JSONContent;
  }

  return fallbackContent;
}
