import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

export async function ensureUniqueBlogSlug(title: string, excludeId?: string) {
  const base = createSlug(title);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.blog.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: { id: true }
    });

    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}
