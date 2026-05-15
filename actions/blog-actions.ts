"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { canEditBlog, hasRequiredRole, roles } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function deleteBlogAction(blogId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) {
    throw new Error("Blog not found");
  }

  if (!canEditBlog(session.user.id, blog.authorId, session.user.role)) {
    throw new Error("Forbidden");
  }

  await prisma.blog.delete({ where: { id: blogId } });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function togglePublishAction(blogId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) {
    throw new Error("Blog not found");
  }

  if (!canEditBlog(session.user.id, blog.authorId, session.user.role)) {
    throw new Error("Forbidden");
  }

  await prisma.blog.update({
    where: { id: blogId },
    data: {
      status: blog.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
      publishedAt: blog.status === "PUBLISHED" ? null : new Date()
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateUserRoleAction(userId: string, roleName: "USER" | "ADMIN" | "SUPER_ADMIN") {
  const session = await auth();
  if (!session?.user || !hasRequiredRole(session.user.role, roles.SUPER_ADMIN)) {
    throw new Error("Forbidden");
  }

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    throw new Error("Role not found");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { roleId: role.id }
  });

  revalidatePath("/admin");
}
