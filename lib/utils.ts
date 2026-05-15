import { clsx, type ClassValue } from "clsx";
import slugify from "slugify";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function createSlug(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true
  });
}

export function absoluteUrl(path: string) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  return `${appUrl}${path}`;
}

export function parsePage(value: string | null, fallback = 1) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}
