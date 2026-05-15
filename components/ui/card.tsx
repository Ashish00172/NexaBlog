import type React from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: Props) {
  return <div className={cn("rounded-xl border border-slate-200 bg-white shadow-panel", className)}>{children}</div>;
}
