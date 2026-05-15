import { NextResponse } from "next/server";
import { apiRoles, requireRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const roleResult = await requireRole(apiRoles.ADMIN);
    if ("error" in roleResult) return roleResult.error;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: {
          select: {
            name: true,
            description: true
          }
        },
        _count: {
          select: {
            blogs: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("USERS_LIST_ERROR", error);
    return NextResponse.json({ error: "Unable to fetch users" }, { status: 500 });
  }
}
