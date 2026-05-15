"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type BlogRowActionsProps = {
  blogId: string;
  currentStatus: "DRAFT" | "PUBLISHED";
};

export function BlogRowActions({ blogId, currentStatus }: BlogRowActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleStatus() {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/${blogId}/publish`, { method: "PATCH" });
      if (!response.ok) {
        toast.error("Unable to update publish status");
        return;
      }
      toast.success(currentStatus === "PUBLISHED" ? "Moved to draft" : "Published successfully");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

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
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" onClick={toggleStatus} loading={loading}>
        {currentStatus === "PUBLISHED" ? "Unpublish" : "Publish"}
      </Button>
      <Button size="sm" variant="danger" onClick={deleteBlog} loading={loading}>
        Delete
      </Button>
    </div>
  );
}
