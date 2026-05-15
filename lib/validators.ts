import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(64)
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number")
    .regex(/[^A-Za-z0-9]/, "Password must include a special character")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const blogSchema = z.object({
  title: z.string().min(5).max(180),
  excerpt: z.string().min(30).max(350),
  content: z.any().refine(
    (value) => value && typeof value === "object" && typeof (value as { type?: unknown }).type === "string",
    "Content is required"
  ),
  coverImage: z.string().url(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().cuid(),
  media: z
    .array(
      z.object({
        secureUrl: z.string().url(),
        publicId: z.string().min(1),
        resource: z.string().min(1),
        format: z.string().optional(),
        bytes: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional()
      })
    )
    .default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT")
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(180).optional().or(z.literal(""))
});

export const roleSchema = z.object({
  roleName: z.enum(["USER", "ADMIN", "SUPER_ADMIN"])
});
