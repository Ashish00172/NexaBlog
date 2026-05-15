import { z } from "zod";

const paginatedSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  pages: z.number()
});

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export { paginatedSchema };
