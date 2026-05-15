import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaHref?: Route;
  ctaLabel?: string;
};

export function EmptyState({ title, description, ctaHref, ctaLabel }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>
      {ctaHref && ctaLabel ? (
        <div className="mt-4">
          <Link href={ctaHref}>
            <Button>{ctaLabel}</Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
