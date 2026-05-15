import { SignupForm } from "@/components/auth/signup-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
      <Card className="w-full p-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Account</h1>
        <p className="mt-1 text-sm text-slate-600">Join the platform and start publishing.</p>
        <div className="mt-6">
          <SignupForm />
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
