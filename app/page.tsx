import Link from "next/link";
import { BlogList } from "@/components/blog/blog-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { canReachDatabase } from "@/lib/db-health";
import { getPublishedBlogs } from "@/lib/db/blogs";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { parsePage } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
};

export const metadata = buildMetadata({
  title: "Home",
  description: "Read company updates, engineering deep dives, and industry insights.",
  path: "/"
});

export default async function HomePage({ searchParams }: Props) {
  const dbReady = await canReachDatabase();
  if (!dbReady) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Blog Listing</h1>
          <p className="text-sm text-slate-600">Search, filter, and explore the latest company publications.</p>
        </header>
        <EmptyState
          title="Database unavailable"
          description="The application cannot connect to PostgreSQL at the moment. Start your database and refresh."
        />
      </div>
    );
  }

  const params = await searchParams;
  const q = params.q?.trim();
  const category = params.category?.trim();
  const sort = params.sort === "oldest" ? "oldest" : "latest";
  const page = parsePage(params.page || null, 1);
  const hasFilters = Boolean(q || category || sort === "oldest" || page > 1);

  const [result, categories] = await Promise.all([
    getPublishedBlogs({ q, category, sort, page, limit: 9 }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Blog Listing</h1>
        <p className="text-sm text-slate-600">Search, filter, and explore the latest company publications.</p>
      </header>

      <form action="/" className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_160px_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search blogs"
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        />
        <select
          name="category"
          defaultValue={category || ""}
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>{item.name}</option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
        <Button type="submit">Apply</Button>
      </form>

      {result.blogs.length ? (
        <BlogList blogs={result.blogs} />
      ) : (
        <EmptyState
          title={hasFilters ? "No blogs found" : "No published blogs yet"}
          description={
            hasFilters
              ? "Try a different keyword or category filter."
              : "Only published blogs appear here. Create a post and publish it to show on the home page."
          }
          ctaHref={hasFilters ? undefined : "/blog/create"}
          ctaLabel={hasFilters ? undefined : "Create Blog"}
        />
      )}

      <div className="flex items-center justify-between">
        {page > 1 ? (
          <Link
            href={`/?q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(category || "")}&sort=${sort}&page=${Math.max(1, page - 1)}`}
          >
            <Button variant="secondary">Previous</Button>
          </Link>
        ) : (
          <Button variant="secondary" disabled>Previous</Button>
        )}
        <p className="text-sm text-slate-600">Page {page} of {Math.max(1, result.pages)}</p>
        {page < result.pages ? (
          <Link
            href={`/?q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(category || "")}&sort=${sort}&page=${Math.min(result.pages || 1, page + 1)}`}
          >
            <Button variant="secondary">Next</Button>
          </Link>
        ) : (
          <Button variant="secondary" disabled>Next</Button>
        )}
      </div>

      <div>
        <Link href="/blog/create">
          <Button>Create Blog</Button>
        </Link>
      </div>
    </div>
  );
}

