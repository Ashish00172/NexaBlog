import Link from "next/link";
import { BlogList } from "@/components/blog/blog-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { canReachDatabase } from "@/lib/db-health";
import { getPublishedBlogs } from "@/lib/db/blogs";
import { parsePage } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogListingPage({ searchParams }: Props) {
  const dbReady = await canReachDatabase();
  if (!dbReady) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Blogs</h1>
        <EmptyState
          title="Database unavailable"
          description="PostgreSQL is not reachable right now. Start the database and refresh."
        />
      </div>
    );
  }

  const params = await searchParams;
  const page = parsePage(params.page || null, 1);
  const { blogs, pages } = await getPublishedBlogs({ page, limit: 9, sort: "latest" });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Blogs</h1>

      {blogs.length ? <BlogList blogs={blogs} /> : <EmptyState title="No blogs found" description="No published blogs are available yet." />}

      <div className="flex items-center justify-between">
        {page > 1 ? (
          <Link href={`/blog?page=${Math.max(1, page - 1)}`}>
            <Button variant="secondary">Previous</Button>
          </Link>
        ) : (
          <Button variant="secondary" disabled>Previous</Button>
        )}
        <p className="text-sm text-slate-600">Page {page} of {Math.max(1, pages)}</p>
        {page < pages ? (
          <Link href={`/blog?page=${Math.min(pages || 1, page + 1)}`}>
            <Button variant="secondary">Next</Button>
          </Link>
        ) : (
          <Button variant="secondary" disabled>Next</Button>
        )}
      </div>
    </div>
  );
}

