import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Sitemap() {
  const base = process.env.APP_URL || "http://localhost:3000";

  try {
    const blogs = await prisma.blog.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true }
    });

    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true }
    });

    return [
      {
        url: `${base}/`,
        lastModified: new Date()
      },
      ...blogs.map((blog) => ({
        url: `${base}/blog/${blog.slug}`,
        lastModified: blog.updatedAt
      })),
      ...categories.map((category) => ({
        url: `${base}/categories/${category.slug}`,
        lastModified: category.updatedAt
      }))
    ];
  } catch (error) {
    console.error("SITEMAP_GENERATION_ERROR", error);
    return [
      {
        url: `${base}/`,
        lastModified: new Date()
      }
    ];
  }
}
