import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasRequiredRole, roles, type RoleName } from "@/lib/permissions";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  return { user };
}

export async function requireRole(requiredRole: RoleName) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult;

  if (!hasRequiredRole(authResult.user.role, requiredRole)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 })
    };
  }

  return authResult;
}

export const apiRoles = roles;
