import { BlogStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { ensureUniqueBlogSlug } from "@/lib/blog-utils";
import { requireAuth } from "@/lib/api-auth";
import { canEditBlog } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { blogSchema } from "@/lib/validators";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  try {
    const { id } = await context.params;

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, image: true, email: true } },
        media: true
      }
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ data: blog });
  } catch (error) {
    console.error("BLOG_GET_ERROR", error);
    return NextResponse.json({ error: "Unable to fetch blog" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: Context) {
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

    const body = await req.json();
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const slug = await ensureUniqueBlogSlug(parsed.data.title, id);

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        slug,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        coverImage: parsed.data.coverImage,
        videoUrl: parsed.data.videoUrl || null,
        categoryId: parsed.data.categoryId,
        status: parsed.data.status,
        publishedAt:
          parsed.data.status === BlogStatus.PUBLISHED
            ? existing.publishedAt ?? new Date()
            : null
      }
    });

    return NextResponse.json({ data: blog });
  } catch (error) {
    console.error("BLOG_UPDATE_ERROR", error);
    return NextResponse.json({ error: "Unable to update blog" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;

    const { id } = await context.params;
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (!canEditBlog(authResult.user.id, blog.authorId, authResult.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.blog.delete({ where: { id } });

    return NextResponse.json({ message: "Blog deleted" });
  } catch (error) {
    console.error("BLOG_DELETE_ERROR", error);
    return NextResponse.json({ error: "Unable to delete blog" }, { status: 500 });
  }
}
