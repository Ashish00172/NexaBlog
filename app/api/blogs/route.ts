import { BlogStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { ensureUniqueBlogSlug } from "@/lib/blog-utils";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { parsePage } from "@/lib/utils";
import { blogSchema } from "@/lib/validators";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parsePage(searchParams.get("page"), 1);
    const limit = Number(searchParams.get("limit") || 9);
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category")?.trim();
    const sort = searchParams.get("sort") === "oldest" ? "asc" : "desc";
    const status = searchParams.get("status") as BlogStatus | null;

    const where = {
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { excerpt: { contains: q, mode: "insensitive" as const } }
            ]
          }
        : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(status ? { status } : { status: BlogStatus.PUBLISHED })
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true, image: true } }
        },
        orderBy: { createdAt: sort },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.blog.count({ where })
    ]);

    return NextResponse.json({
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("BLOG_LIST_ERROR", error);
    return NextResponse.json({ error: "Unable to fetch blogs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;

    const body = await req.json();
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const slug = await ensureUniqueBlogSlug(parsed.data.title);

    const blog = await prisma.blog.create({
      data: {
        slug,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        coverImage: parsed.data.coverImage,
        videoUrl: parsed.data.videoUrl || null,
        categoryId: parsed.data.categoryId,
        authorId: authResult.user.id,
        status: parsed.data.status,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
        media: {
          create: parsed.data.media.map((item) => ({
            secureUrl: item.secureUrl,
            publicId: item.publicId,
            resource: item.resource,
            format: item.format,
            bytes: item.bytes,
            width: item.width,
            height: item.height,
            userId: authResult.user.id
          }))
        }
      }
    });

    return NextResponse.json({ data: blog }, { status: 201 });
  } catch (error) {
    console.error("BLOG_CREATE_ERROR", error);
    return NextResponse.json({ error: "Unable to create blog" }, { status: 500 });
  }
}
