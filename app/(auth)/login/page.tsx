import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

function getSafeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || !callbackUrl.startsWith("/")) {
    return "/";
  }
  return callbackUrl;
}

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user) {
    redirect(getSafeCallbackUrl(params.callbackUrl));
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
      <Card className="w-full p-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
        <p className="mt-1 text-sm text-slate-600">Login to create and manage blog posts.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-4 text-sm text-slate-600">
          No account?{" "}
          <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
