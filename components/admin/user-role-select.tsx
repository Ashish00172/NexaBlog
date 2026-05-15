"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";

type UserRoleSelectProps = {
  userId: string;
  currentRole: "USER" | "ADMIN" | "SUPER_ADMIN";
  disabled?: boolean;
};

export function UserRoleSelect({ userId, currentRole, disabled }: UserRoleSelectProps) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onRoleChange(nextRole: "USER" | "ADMIN" | "SUPER_ADMIN") {
    setRole(nextRole);
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName: nextRole })
      });

      if (!response.ok) {
        setRole(currentRole);
        toast.error("Role update failed");
        return;
      }

      toast.success("Role updated");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Select
      value={role}
      disabled={disabled || loading}
      onChange={(event) => onRoleChange(event.target.value as "USER" | "ADMIN" | "SUPER_ADMIN")}
      className="h-8 w-36"
    >
      <option value="USER">USER</option>
      <option value="ADMIN">ADMIN</option>
      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
    </Select>
  );
}
