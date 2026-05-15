export const roles = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN"
} as const;

export type RoleName = (typeof roles)[keyof typeof roles];

const roleWeight: Record<RoleName, number> = {
  USER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3
};

export function hasRequiredRole(userRole: string | undefined, required: RoleName) {
  if (!userRole) return false;
  const normalized = userRole as RoleName;
  return (roleWeight[normalized] ?? 0) >= roleWeight[required];
}

export function canEditBlog(userId: string, authorId: string, role: string | undefined) {
  if (userId === authorId) return true;
  return hasRequiredRole(role, roles.ADMIN);
}
