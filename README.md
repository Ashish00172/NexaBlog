# NexaBlog - Enterprise Blog Platform

Production-grade full-stack blog platform built with Next.js App Router, PostgreSQL, Prisma, NextAuth, Tailwind CSS, and Cloudinary.

## Features

- Authentication: signup, login, logout, session handling, protected routes
- Role-based access control: `USER`, `ADMIN`, `SUPER_ADMIN`
- Full blog lifecycle: create, read, update, delete, draft/publish
- Rich content editor using Tiptap:
  - bold, italic, headings, lists
  - image embed
  - video embed
  - code blocks
- Public UX:
  - blog listing
  - detail pages
  - category pages
  - search + filter + sort
- Admin dashboard:
  - manage blogs
  - user visibility
  - role management endpoints
  - moderation controls
- SEO:
  - SSR
  - dynamic metadata
  - Open Graph tags
  - sitemap
  - robots.txt
- Developer experience:
  - TypeScript
  - Zod validation
  - reusable components
  - clean folder structure
  - Vercel-ready deployment setup

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- PostgreSQL
- Prisma ORM
- NextAuth v5 (Credentials + Prisma Adapter)
- Tailwind CSS
- Cloudinary
- Tiptap
- Zod
- React Hook Form
- Sonner (toast notifications)

## Folder Structure

```txt
app/
  api/
    auth/
    blogs/
    categories/
    search/
    upload/
    users/
  (auth)/
  admin/
  blog/
  categories/
  profile/
  search/
  globals.css
  layout.tsx
  page.tsx
components/
  auth/
  blog/
  layout/
  providers/
  ui/
lib/
  db/
  api-auth.ts
  auth.ts
  blog-utils.ts
  cloudinary.ts
  env.ts
  permissions.ts
  prisma.ts
  seo.ts
  utils.ts
prisma/
  schema.prisma
  seed.ts
actions/
api/
hooks/
types/
utils/
styles/
public/
```

## Database Models

Defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

- `Role`
- `User`
- `Blog`
- `Category`
- `Media`
- `Account` (NextAuth)
- `Session` (NextAuth)
- `VerificationToken` (NextAuth)

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set real values for:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `APP_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client

```bash
npm run prisma:generate
```

3. Run migrations

```bash
npm run prisma:migrate
```

4. Seed base data (roles, sample users, categories, starter blog)

```bash
npm run prisma:seed
```

5. Start development server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## PostgreSQL Quick Start (Docker)

If you see errors like `Can't reach database server at localhost:5432`, start PostgreSQL locally:

```bash
npm run db:up
```

Then run:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Check DB logs:

```bash
npm run db:logs
```

Stop DB:

```bash
npm run db:down
```

## Default Seed Accounts

Use password: `ChangeMe123!`

- Admin: `admin@company.com`
- Super Admin: `superadmin@company.com`

Change these credentials immediately in production.

## API Endpoints

### Auth

- `POST /api/auth/register`
- `GET|POST /api/auth/[...nextauth]`

### Blogs

- `GET /api/blogs`
- `POST /api/blogs`
- `GET /api/blogs/:id`
- `PATCH /api/blogs/:id`
- `DELETE /api/blogs/:id`
- `PATCH /api/blogs/:id/publish`

### Categories

- `GET /api/categories`
- `POST /api/categories` (Admin+)

### Search

- `GET /api/search?q=...`

### Users / RBAC

- `GET /api/users` (Admin+)
- `PATCH /api/users/:id/role` (Super Admin)

### Uploads

- `POST /api/upload/signature`
- `POST /api/upload`

## Deployment (Vercel)

1. Push repo to GitHub.
2. Import project in Vercel.
3. Set all environment variables from `.env.example` in Vercel project settings.
4. Configure managed PostgreSQL and set `DATABASE_URL`.
5. In Build Command, keep default `next build`.
6. Add post-deploy migration step if needed:

```bash
npm run prisma:deploy
```

## Security Notes

- Passwords are hashed with `bcryptjs`.
- API routes enforce auth and role checks.
- Cloudinary uploads use signed upload parameters.
- Validation is enforced with Zod on API boundaries.

## Performance Notes

- Server-rendered pages with optimized data queries
- Pagination support on listing endpoints
- Next.js image optimization enabled for Cloudinary
- Lazy loading for media-heavy content

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run db:up
npm run db:down
npm run db:logs
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
```
