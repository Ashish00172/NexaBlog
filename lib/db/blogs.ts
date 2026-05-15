import { BlogStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const blogInclude = {
  category: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true, image: true } }
} satisfies Prisma.BlogInclude;

export async function getPublishedBlogs(params: {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: "latest" | "oldest";
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 9;
  const skip = (page - 1) * limit;
  const where: Prisma.BlogWhereInput = {
    status: BlogStatus.PUBLISHED,
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q, mode: "insensitive" } },
            { excerpt: { contains: params.q, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(params.category ? { category: { slug: params.category } } : {})
  };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: blogInclude,
      orderBy: { createdAt: params.sort === "oldest" ? "asc" : "desc" },
      skip,
      take: limit
    }),
    prisma.blog.count({ where })
  ]);

  return {
    blogs,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
}

export async function getBlogBySlug(slug: string) {
  return prisma.blog.findUnique({
    where: { slug },
    include: {
      ...blogInclude,
      media: true
    }
  });
}
