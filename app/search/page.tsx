import Link from "next/link";
import { BlogList } from "@/components/blog/blog-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { canReachDatabase } from "@/lib/db-health";
import { getPublishedBlogs } from "@/lib/db/blogs";

type Props = {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const dbReady = await canReachDatabase();
  if (!dbReady) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Search Blogs</h1>
        </header>
        <EmptyState
          title="Database unavailable"
          description="Search is temporarily unavailable because PostgreSQL is not reachable."
        />
      </div>
    );
  }

  const params = await searchParams;
  const q = params.q?.trim();
  const category = params.category?.trim();
  const sort = params.sort === "oldest" ? "oldest" : "latest";

  const { blogs } = await getPublishedBlogs({ q, category, sort, limit: 12, page: 1 });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Search Blogs</h1>
        <form action="/search" className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_120px]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by title or excerpt"
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
          <input
            name="category"
            defaultValue={category}
            placeholder="Category slug"
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
          <select
            name="sort"
            defaultValue={sort}
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
          <div className="md:col-span-3">
            <Button type="submit">Apply Filters</Button>
          </div>
        </form>
      </header>

      {blogs.length ? (
        <BlogList blogs={blogs} />
      ) : (
        <EmptyState title="No search results" description="Try another keyword or remove category filter." />
      )}

      <div>
        <Link href="/blog">
          <Button variant="secondary">Browse all blogs</Button>
        </Link>
      </div>
    </div>
  );
}
