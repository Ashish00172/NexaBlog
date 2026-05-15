"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-panel">
          <h2 className="text-2xl font-bold text-slate-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-600">{error.message || "Unexpected application error"}</p>
          <div className="mt-4">
            <Button onClick={() => reset()}>Try again</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
