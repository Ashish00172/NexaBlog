"use client";

import type React from "react";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getSafeCallbackUrl(rawCallbackUrl: string | null) {
  if (!rawCallbackUrl || !rawCallbackUrl.startsWith("/")) {
    return "/";
  }
  return rawCallbackUrl;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
        const response = await signIn("credentials", {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
          redirectTo: callbackUrl
        });

        if (!response) {
          toast.error("Login failed. Please try again.");
          return;
        }

        if (response.error) {
          toast.error("Invalid credentials. Please try again.");
          return;
        }

        toast.success("Logged in successfully");
        window.location.assign(response.url || callbackUrl);
      } catch {
        toast.error("Network error. Please check your connection and try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>

      <Button type="submit" className="w-full" loading={pending}>
        Login
      </Button>
    </form>
  );
}
