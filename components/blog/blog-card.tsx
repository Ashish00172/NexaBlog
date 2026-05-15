import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type BlogCardProps = {
  blog: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string;
    createdAt: Date;
    category: { name: string; slug: string };
    author: { name: string };
  };
};

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/blog/${blog.slug}`}>
        <div className="relative h-52 w-full overflow-hidden">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover transition duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>

      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Badge>{blog.category.name}</Badge>
          <span className="text-xs text-slate-500">{formatDate(blog.createdAt)}</span>
        </div>

        <Link href={`/blog/${blog.slug}`} className="block">
          <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-slate-900">{blog.title}</h3>
        </Link>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{blog.excerpt}</p>

        <div className="text-sm text-slate-500">By {blog.author.name}</div>
      </div>
    </Card>
  );
}
