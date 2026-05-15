import { BlogCard } from "@/components/blog/blog-card";

type BlogListProps = {
  blogs: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string;
    createdAt: Date;
    category: { name: string; slug: string };
    author: { name: string };
  }>;
};

export function BlogList({ blogs }: BlogListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}
