import { NextResponse } from "next/server";
import { apiRoles, requireRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { roleSchema } from "@/lib/validators";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: Context) {
  try {
    const roleResult = await requireRole(apiRoles.SUPER_ADMIN);
    if ("error" in roleResult) return roleResult.error;

    const { id } = await context.params;
    const body = await req.json();
    const parsed = roleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const role = await prisma.role.findUnique({ where: { name: parsed.data.roleName } });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { roleId: role.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: { select: { name: true } }
      }
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("USER_ROLE_UPDATE_ERROR", error);
    return NextResponse.json({ error: "Unable to update role" }, { status: 500 });
  }
}
