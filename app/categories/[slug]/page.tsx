import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogList } from "@/components/blog/blog-list";
import { EmptyState } from "@/components/ui/empty-state";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";

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
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) {
    return {
      title: "Category Not Found"
    };
  }

  return {
    title: `${category.name} Category`,
    description: category.description || `Explore ${category.name} blogs.`
  };
}

export default async function CategoryPage({ params }: Props) {
  const dbReady = await canReachDatabase();
  if (!dbReady) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Database unavailable"
          description="Category content is unavailable because PostgreSQL is not reachable."
        />
      </div>
    );
  }

  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      blogs: {
        where: { status: "PUBLISHED" },
        include: {
          category: { select: { name: true, slug: true } },
          author: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!category) return notFound();
  const blogs = category.blogs.map((blog) => ({
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    coverImage: blog.coverImage,
    createdAt: blog.createdAt,
    category: blog.category,
    author: blog.author
  }));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{category.name}</h1>
        <p className="mt-2 text-sm text-slate-600">{category.description}</p>
      </header>

      {blogs.length ? (
        <BlogList blogs={blogs} />
      ) : (
        <EmptyState title="No blogs in this category" description="Check back later for new publications." />
      )}
    </div>
  );
}

