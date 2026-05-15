import Link from "next/link";
import { auth } from "@/auth";
import { EmptyState } from "@/components/ui/empty-state";
import { canReachDatabase } from "@/lib/db-health";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const dbReady = await canReachDatabase();
  if (!dbReady) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Database unavailable"
          description="Profile data cannot be loaded because PostgreSQL is not reachable."
        />
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: true,
      blogs: {
        orderBy: { updatedAt: "desc" },
        include: {
          category: { select: { name: true } }
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
        <p className="mt-1 text-sm text-slate-600">{user.email}</p>
        <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Role: {user.role.name}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Your Blogs</h2>
        {user.blogs.length ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {user.blogs.map((blog) => (
                  <tr key={blog.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{blog.title}</td>
                    <td className="px-4 py-3">{blog.category.name}</td>
                    <td className="px-4 py-3">{blog.status}</td>
                    <td className="px-4 py-3">{formatDate(blog.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/blog/edit/${blog.id}`} className="text-brand-600 hover:text-brand-700">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No blogs created yet" description="Start writing your first article to build your author profile." ctaHref="/blog/create" ctaLabel="Create Blog" />
        )}
      </section>
    </div>
  );
}

