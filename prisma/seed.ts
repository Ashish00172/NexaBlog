import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function getRichTextContent(title: string, body: string) {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: title }]
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: body }]
      }
    ]
  };
}

async function main() {
  await prisma.$transaction([
    prisma.verificationToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.media.deleteMany(),
    prisma.blog.deleteMany(),
    prisma.user.deleteMany(),
    prisma.category.deleteMany(),
    prisma.role.deleteMany()
  ]);

  const roleData = [
    { name: "USER", description: "Standard blog writer" },
    { name: "ADMIN", description: "Content moderator and manager" },
    { name: "SUPER_ADMIN", description: "Full platform access" },
    { name: "EDITOR", description: "Editorial reviewer role" },
    { name: "AUTHOR", description: "Independent author role" }
  ];

  await prisma.role.createMany({ data: roleData });
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
  const roleByName = new Map(roles.map((role) => [role.name, role]));

  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  const userData = [
    { name: "Platform Admin", email: "admin@company.com", roleName: "ADMIN" },
    { name: "Super Admin", email: "superadmin@company.com", roleName: "SUPER_ADMIN" },
    { name: "Ava Writer", email: "ava.writer@company.com", roleName: "USER" },
    { name: "Ethan Editor", email: "ethan.editor@company.com", roleName: "EDITOR" },
    { name: "Nora Author", email: "nora.author@company.com", roleName: "AUTHOR" }
  ];

  for (const user of userData) {
    const role = roleByName.get(user.roleName);
    if (!role) {
      throw new Error(`Missing role: ${user.roleName}`);
    }

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash,
        roleId: role.id,
        bio: `${user.name} contributes to the company blog.`,
        image: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`
      }
    });
  }

  const users = await prisma.user.findMany({ orderBy: { email: "asc" } });

  const categoryData = [
    { name: "Engineering", slug: "engineering", description: "Engineering updates and tutorials" },
    { name: "Product", slug: "product", description: "Product launches and roadmap notes" },
    { name: "Design", slug: "design", description: "Design insights and UI exploration" },
    { name: "Marketing", slug: "marketing", description: "Marketing strategy and growth stories" },
    { name: "Leadership", slug: "leadership", description: "Leadership lessons and team culture" }
  ];

  await prisma.category.createMany({ data: categoryData });
  const categories = await prisma.category.findMany({ orderBy: { slug: "asc" } });

  const blogData = [
    {
      slug: "shipping-faster-with-platform-thinking",
      title: "Shipping Faster with Platform Thinking",
      excerpt: "How shared foundations help teams ship faster with fewer regressions.",
      status: "PUBLISHED" as const,
      coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
      slug: "designing-for-focus-in-busy-products",
      title: "Designing for Focus in Busy Products",
      excerpt: "Practical ways to reduce cognitive load in feature-rich interfaces.",
      status: "PUBLISHED" as const,
      coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80",
      videoUrl: null
    },
    {
      slug: "building-a-reliable-content-workflow",
      title: "Building a Reliable Content Workflow",
      excerpt: "A repeatable editorial system for planning, writing, and publishing.",
      status: "DRAFT" as const,
      coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
      videoUrl: null
    },
    {
      slug: "measuring-impact-beyond-pageviews",
      title: "Measuring Impact Beyond Pageviews",
      excerpt: "A better KPI stack for content teams that care about outcomes.",
      status: "PUBLISHED" as const,
      coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
      videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U"
    },
    {
      slug: "what-we-learned-from-our-first-100-posts",
      title: "What We Learned from Our First 100 Posts",
      excerpt: "Patterns, failures, and wins from scaling a modern blog program.",
      status: "DRAFT" as const,
      coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
      videoUrl: null
    }
  ];

  for (let index = 0; index < blogData.length; index += 1) {
    const blog = blogData[index];
    const author = users[index % users.length];
    const category = categories[index % categories.length];

    await prisma.blog.create({
      data: {
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.excerpt,
        content: getRichTextContent(
          blog.title,
          "This seeded article is valid JSON content that mirrors the editor structure used by the application."
        ),
        coverImage: blog.coverImage,
        videoUrl: blog.videoUrl,
        status: blog.status,
        authorId: author.id,
        categoryId: category.id,
        publishedAt: blog.status === "PUBLISHED" ? new Date() : null
      }
    });
  }

  const blogs = await prisma.blog.findMany({ orderBy: { slug: "asc" } });

  const mediaData = [
    { resource: "image", format: "jpg", bytes: 154321, width: 1200, height: 800 },
    { resource: "image", format: "png", bytes: 221478, width: 1280, height: 720 },
    { resource: "video", format: "mp4", bytes: 5842111, width: 1920, height: 1080 },
    { resource: "image", format: "webp", bytes: 112399, width: 1080, height: 1080 },
    { resource: "image", format: "jpg", bytes: 176500, width: 1600, height: 900 }
  ];

  for (let index = 0; index < mediaData.length; index += 1) {
    const media = mediaData[index];
    const user = users[index % users.length];
    const blog = blogs[index % blogs.length];

    await prisma.media.create({
      data: {
        secureUrl: `https://res.cloudinary.com/demo/image/upload/v1/blog-seed/asset-${index + 1}.${media.format}`,
        publicId: `blog-seed-asset-${index + 1}`,
        resource: media.resource,
        format: media.format,
        bytes: media.bytes,
        width: media.width,
        height: media.height,
        userId: user.id,
        blogId: blog.id
      }
    });
  }

  const now = Date.now();
  for (let index = 0; index < users.length; index += 1) {
    const user = users[index];

    await prisma.account.create({
      data: {
        userId: user.id,
        type: "oauth",
        provider: "google",
        providerAccountId: `google-seed-${index + 1}`,
        access_token: `seed_access_token_${index + 1}`,
        refresh_token: `seed_refresh_token_${index + 1}`,
        expires_at: Math.floor((now + (index + 1) * 86_400_000) / 1000),
        token_type: "Bearer",
        scope: "openid profile email"
      }
    });

    await prisma.session.create({
      data: {
        sessionToken: `seed_session_token_${index + 1}`,
        userId: user.id,
        expires: new Date(now + (index + 7) * 86_400_000)
      }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: `seed_verification_token_${index + 1}`,
        expires: new Date(now + (index + 2) * 3_600_000)
      }
    });
  }

  console.log("Seeding complete: 5 rows inserted in every table.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
