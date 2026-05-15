import { auth } from "@/auth";
import { BlogForm } from "@/components/blog/blog-form";
import { EmptyState } from "@/components/ui/empty-state";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";

export const metadata = buildMetadata({
  title: "Create Blog",
  description: "Create and publish a rich blog post.",
  path: "/blog/create"
});

export default async function CreateBlogPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/blog/create");
  }
  const dbReady = await canReachDatabase();
  if (!dbReady) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Database unavailable"
          description="Cannot load blog creation data because PostgreSQL is not reachable."
        />
      </div>
    );
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create New Blog</h1>
      <BlogForm
        mode="create"
        authorName={session.user.name || session.user.email || "Unknown author"}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </div>
  );
}
