import { auth } from "@/auth";
import { BlogForm } from "@/components/blog/blog-form";
import { EmptyState } from "@/components/ui/empty-state";
import { canReachDatabase } from "@/lib/db-health";
import { canEditBlog } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { toEditorContent } from "@/lib/tiptap";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const dbReady = await canReachDatabase();
  if (!dbReady) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Database unavailable"
          description="Cannot load blog editing data because PostgreSQL is not reachable."
        />
      </div>
    );
  }

  const { id } = await params;

  const [blog, categories] = await Promise.all([
    prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true
          }
        },
        media: true
      }
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  if (!blog) return notFound();

  if (!canEditBlog(session.user.id, blog.authorId, session.user.role)) {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Blog</h1>
      <BlogForm
        mode="edit"
        authorName={blog.author.name}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        initialData={{
          id: blog.id,
          title: blog.title,
          excerpt: blog.excerpt,
          content: toEditorContent(blog.content),
          coverImage: blog.coverImage,
          videoUrl: blog.videoUrl,
          categoryId: blog.categoryId,
          status: blog.status,
          media: blog.media.map((media) => ({
            secureUrl: media.secureUrl,
            publicId: media.publicId,
            resource: media.resource,
            format: media.format,
            bytes: media.bytes,
            width: media.width,
            height: media.height
          }))
        }}
      />
    </div>
  );
}
