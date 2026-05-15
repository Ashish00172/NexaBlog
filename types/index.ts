import { RoleName } from "@/lib/permissions";

export type BlogListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
    image: string | null;
  };
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: RoleName;
};
