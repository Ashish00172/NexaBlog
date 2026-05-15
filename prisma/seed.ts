import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "USER", description: "Standard blog writer" },
    { name: "ADMIN", description: "Content moderator and manager" },
    { name: "SUPER_ADMIN", description: "Full platform access" }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role
    });
  }

  const [userRole, adminRole, superAdminRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: "USER" } }),
    prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } }),
    prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } })
  ]);

  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@company.com",
      passwordHash,
      roleId: adminRole.id
    }
  });

  await prisma.user.upsert({
    where: { email: "superadmin@company.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@company.com",
      passwordHash,
      roleId: superAdminRole.id
    }
  });

  const categories = ["Engineering", "Product", "Design", "Marketing", "Leadership"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: slugify(name, { lower: true, strict: true }),
        description: `${name} related insights and updates`
      }
    });
  }

  const engineering = await prisma.category.findUniqueOrThrow({ where: { name: "Engineering" } });

  await prisma.blog.upsert({
    where: { slug: "welcome-to-our-enterprise-blog-platform" },
    update: {},
    create: {
      slug: "welcome-to-our-enterprise-blog-platform",
      title: "Welcome to Our Enterprise Blog Platform",
      excerpt: "A robust company-grade publication stack for modern teams.",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Built for scale and editorial quality" }]
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This sample post demonstrates rich text content persisted as JSON for SEO-friendly rendering and future extensibility."
              }
            ]
          }
        ]
      },
      coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
      categoryId: engineering.id,
      authorId: admin.id,
      status: "PUBLISHED",
      publishedAt: new Date()
    }
  });
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
