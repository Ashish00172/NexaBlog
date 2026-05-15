import Link from "next/link";
import { auth } from "@/auth";
import { BlogRowActions } from "@/components/admin/blog-row-actions";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { EmptyState } from "@/components/ui/empty-state";
import { canReachDatabase } from "@/lib/db-health";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { hasRequiredRole, roles } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || !hasRequiredRole(session.user.role, roles.ADMIN)) {
    redirect("/");
  }
  const dbReady = await canReachDatabase();
  if (!dbReady) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Database unavailable"
          description="Admin data cannot be loaded because PostgreSQL is not reachable."
        />
      </div>
    );
  }
  const isSuperAdmin = session.user.role === roles.SUPER_ADMIN;

  const [blogs, users, categories] = await Promise.all([
    prisma.blog.findMany({
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 20
    }),
    prisma.user.findMany({
      include: {
        role: { select: { name: true } },
        _count: { select: { blogs: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { blogs: true } }
      },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-600">Moderate content, manage users, and monitor publishing activity.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
          <p className="text-sm text-slate-500">Total Blogs</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{blogs.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
          <p className="text-sm text-slate-500">Categories</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{categories.length}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Recent Blogs</h2>
        {blogs.length ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Author</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{blog.title}</td>
                    <td className="px-4 py-3">{blog.author.name}</td>
                    <td className="px-4 py-3">{blog.category.name}</td>
                    <td className="px-4 py-3">{blog.status}</td>
                    <td className="px-4 py-3">{formatDate(blog.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/blog/edit/${blog.id}`}>
                          <Button size="sm" variant="secondary">Edit</Button>
                        </Link>
                        <BlogRowActions blogId={blog.id} currentStatus={blog.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No content yet" description="Published and draft blogs will appear here for moderation." />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">User Access Control</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Blogs</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <UserRoleSelect
                      userId={user.id}
                      currentRole={user.role.name as "USER" | "ADMIN" | "SUPER_ADMIN"}
                      disabled={!isSuperAdmin}
                    />
                  </td>
                  <td className="px-4 py-3">{user._count.blogs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

