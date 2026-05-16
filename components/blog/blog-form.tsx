"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { BlogStatus } from "@prisma/client";
import type { JSONContent } from "@tiptap/core";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/blog/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { blogSchema } from "@/lib/validators";
import type { z } from "zod";

type BlogFormValues = z.input<typeof blogSchema>;

type BlogFormProps = {
  mode: "create" | "edit";
  authorName: string;
  categories: Array<{ id: string; name: string }>;
  initialData?: {
    id: string;
    title: string;
    excerpt: string;
    content: JSONContent;
    coverImage: string;
    videoUrl: string | null;
    categoryId: string;
    status: BlogStatus;
    media: Array<{
      secureUrl: string;
      publicId: string;
      resource: string;
      format: string | null;
      bytes: number | null;
      width: number | null;
      height: number | null;
    }>;
  };
};

const defaultContent: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }]
};

export function BlogForm({ mode, authorName, categories, initialData }: BlogFormProps) {
  const router = useRouter();

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: initialData?.title || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || defaultContent,
      coverImage: initialData?.coverImage || "",
      videoUrl: initialData?.videoUrl || "",
      categoryId: initialData?.categoryId || "",
      media:
        initialData?.media.map((media) => ({
          secureUrl: media.secureUrl,
          publicId: media.publicId,
          resource: media.resource,
          format: media.format ?? undefined,
          bytes: media.bytes ?? undefined,
          width: media.width ?? undefined,
          height: media.height ?? undefined
        })) || [],
      status: initialData?.status || "DRAFT"
    }
  });

  async function onSubmit(values: BlogFormValues) {
    try {
      const endpoint = mode === "create" ? "/api/blogs" : `/api/blogs/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        toast.error(payload?.error || "Unable to save blog");
        return;
      }

      const payload = await response.json();
      toast.success(mode === "create" ? "Blog created" : "Blog updated");
      const savedBlog = payload.data as { id: string; slug: string; status: BlogStatus };
      router.push(savedBlog.status === "DRAFT" ? `/blog/edit/${savedBlog.id}` : `/blog/${savedBlog.slug}`);
      router.refresh();
    } catch {
      toast.error("Unexpected error while saving blog");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Author</label>
          {/* Author identity is assigned by the authenticated session and not editable in the form. */}
          <Input value={authorName} readOnly aria-readonly />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Title</label>
          <Input placeholder="Write an attention-worthy title" {...form.register("title")} />
          <p className="text-xs text-red-600">{form.formState.errors.title?.message}</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Excerpt</label>
          <Textarea rows={4} placeholder="Brief summary (for cards and SEO snippets)" {...form.register("excerpt")} />
          <p className="text-xs text-red-600">{form.formState.errors.excerpt?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Category</label>
          <Select {...form.register("categoryId")}>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <p className="text-xs text-red-600">{form.formState.errors.categoryId?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <Select {...form.register("status")}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Cover Image URL</label>
          <Input placeholder="https://..." {...form.register("coverImage")} />
          <p className="text-xs text-red-600">{form.formState.errors.coverImage?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Embedded Video URL (optional)</label>
          <Input placeholder="https://www.youtube.com/embed/..." {...form.register("videoUrl")} />
          <p className="text-xs text-red-600">{form.formState.errors.videoUrl?.message}</p>
        </div>

      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Content</label>
        <TiptapEditor
          value={form.watch("content") || defaultContent}
          onChange={(content) => form.setValue("content", content, { shouldValidate: true })}
        />
        <p className="text-xs text-red-600">{form.formState.errors.content?.message as string | undefined}</p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={form.formState.isSubmitting}>
          {mode === "create" ? "Create blog" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

