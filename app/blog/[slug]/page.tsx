import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogContent } from "@/components/blog/blog-content";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { toEditorContent } from "@/lib/tiptap";
import { formatDate } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dbReady = await canReachDatabase();
  if (!dbReady) {
    return {
      title: "Database Unavailable"
    };
  }

  const { slug } = await params;
  const blog = await prisma.blog.findUnique({ where: { slug } });

  if (!blog) {
    return {
      title: "Blog Not Found"
    };
  }

  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: [blog.coverImage]
    }
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const dbReady = await canReachDatabase();
  if (!dbReady) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Database unavailable"
          description="Blog details are temporarily unavailable because PostgreSQL is not reachable."
        />
      </div>
    );
  }

  const { slug } = await params;

  const blog = await prisma.blog.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      media: {
        select: {
          id: true,
          secureUrl: true,
          resource: true
        }
      }
    }
  });

  if (!blog) return notFound();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <Badge>{blog.category.name}</Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{blog.title}</h1>
        <p className="max-w-3xl text-lg leading-7 text-slate-600">{blog.excerpt}</p>
        <div className="text-sm text-slate-500">
          By {blog.author.name} | {formatDate(blog.publishedAt || blog.createdAt)}
        </div>
      </header>

      <BlogContent
        content={toEditorContent(blog.content)}
        coverImage={blog.coverImage}
        title={blog.title}
        videoUrl={blog.videoUrl}
        media={blog.media}
      />
    </div>
  );
}

