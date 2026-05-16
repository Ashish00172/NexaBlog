"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type BlogOwnerActionsProps = {
  blogId: string;
  editHref: string;
  redirectAfterDelete?: string;
  size?: "sm" | "md" | "lg";
};

export function BlogOwnerActions({ blogId, editHref, redirectAfterDelete, size = "sm" }: BlogOwnerActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function deleteBlog() {
    const confirmed = window.confirm("Delete this blog permanently?");
    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/${blogId}`, { method: "DELETE" });
      if (!response.ok) {
        toast.error("Unable to delete blog");
        return;
      }
      toast.success("Blog deleted");

      if (redirectAfterDelete) {
        router.push(redirectAfterDelete);
        return;
      }

      router.refresh();
    } catch {
      toast.error("Unexpected error while deleting blog");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={editHref}>
        <Button size={size} variant="secondary">
          Edit
        </Button>
      </Link>
      <Button size={size} variant="danger" onClick={deleteBlog} loading={loading}>
        Remove
      </Button>
    </div>
  );
}
