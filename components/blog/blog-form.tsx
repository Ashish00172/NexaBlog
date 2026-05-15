"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { BlogStatus } from "@prisma/client";
import type { JSONContent } from "@tiptap/core";
import type React from "react";
import { useMemo, useState } from "react";
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
  const [uploading, setUploading] = useState(false);

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

  const mediaPreview = useMemo(() => form.watch("media") || [], [form]);

  async function uploadFile(file: File) {
    const signatureRes = await fetch("/api/upload/signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "nexablog/blogs" })
    });

    if (!signatureRes.ok) throw new Error("Unable to get upload signature");

    const signatureData = await signatureRes.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", String(signatureData.timestamp));
    formData.append("signature", signatureData.signature);
    formData.append("folder", signatureData.folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`, {
      method: "POST",
      body: formData
    });

    if (!uploadRes.ok) {
      throw new Error("Upload failed");
    }

    const uploaded = await uploadRes.json();

    return {
      secureUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      resource: uploaded.resource_type,
      format: uploaded.format || undefined,
      bytes: uploaded.bytes || undefined,
      width: uploaded.width || undefined,
      height: uploaded.height || undefined
    };
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploaded = await uploadFile(file);
      form.setValue("coverImage", uploaded.secureUrl, { shouldValidate: true });
      toast.success("Cover image uploaded");
    } catch {
      toast.error("Unable to upload cover image");
    } finally {
      setUploading(false);
    }
  }

  async function handleMediaUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      setUploading(true);
      const uploads = await Promise.all(Array.from(files).map(uploadFile));
      const existing = form.getValues("media") || [];
      form.setValue("media", [...existing, ...uploads], { shouldValidate: true });
      toast.success("Media files uploaded");
    } catch {
      toast.error("Unable to upload media files");
    } finally {
      setUploading(false);
    }
  }

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
      router.push(`/blog/${payload.data.slug}`);
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
          <Input type="file" accept="image/*" onChange={handleCoverUpload} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Embedded Video URL (optional)</label>
          <Input placeholder="https://www.youtube.com/embed/..." {...form.register("videoUrl")} />
          <p className="text-xs text-red-600">{form.formState.errors.videoUrl?.message}</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Additional Media</label>
          <Input type="file" accept="image/*,video/*" multiple onChange={handleMediaUpload} />
          {mediaPreview.length ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {mediaPreview.map((media, index) => (
                <p key={media.publicId ?? `media-${index}`} className="truncate rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
                  {media.secureUrl}
                </p>
              ))}
            </div>
          ) : null}
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
        <Button type="submit" loading={form.formState.isSubmitting || uploading}>
          {mode === "create" ? "Create blog" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

