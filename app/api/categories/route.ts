import { NextResponse } from "next/server";
import { apiRoles, requireRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";
import { categorySchema } from "@/lib/validators";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { blogs: true }
        }
      }
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("CATEGORY_LIST_ERROR", error);
    return NextResponse.json({ error: "Unable to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const roleResult = await requireRole(apiRoles.ADMIN);
    if ("error" in roleResult) return roleResult.error;

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: createSlug(parsed.data.name),
        description: parsed.data.description || null
      }
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("CATEGORY_CREATE_ERROR", error);
    return NextResponse.json({ error: "Unable to create category" }, { status: 500 });
  }
}
