import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const blogs = await prisma.blog.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } }
        ]
      },
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json({ data: blogs });
  } catch (error) {
    console.error("SEARCH_ERROR", error);
    return NextResponse.json({ error: "Unable to search blogs" }, { status: 500 });
  }
}
