import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-600">404</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">The content you are looking for may have moved or no longer exists.</p>
      <div className="mt-6">
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
