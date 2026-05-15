import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/signout-button";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-slate-900">
          NexaBlog
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/" className="transition hover:text-brand-600">Home</Link>
          <Link href="/search" className="transition hover:text-brand-600">Search</Link>
          <Link href="/blog/create" className="transition hover:text-brand-600">Write</Link>
          {session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN" ? (
            <Link href="/admin" className="transition hover:text-brand-600">Admin</Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Link href="/profile">
                <Button variant="secondary" size="sm">Profile</Button>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="secondary" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Signup</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
