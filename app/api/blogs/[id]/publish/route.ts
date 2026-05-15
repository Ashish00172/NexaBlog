import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { canEditBlog } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_: Request, context: Context) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;

    const { id } = await context.params;

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (!canEditBlog(authResult.user.id, existing.authorId, authResult.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const nextStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        status: nextStatus,
        publishedAt: nextStatus === "PUBLISHED" ? existing.publishedAt ?? new Date() : null
      }
    });

    return NextResponse.json({ data: blog });
  } catch (error) {
    console.error("BLOG_PUBLISH_ERROR", error);
    return NextResponse.json({ error: "Unable to toggle publish state" }, { status: 500 });
  }
}
