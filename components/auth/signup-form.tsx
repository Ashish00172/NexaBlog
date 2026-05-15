"use client";

import type React from "react";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;

  const error = (payload as { error?: unknown }).error;
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const fieldErrors = (error as { fieldErrors?: Record<string, unknown> }).fieldErrors;
    if (fieldErrors && typeof fieldErrors === "object") {
      for (const value of Object.values(fieldErrors)) {
        if (Array.isArray(value)) {
          const firstFieldError = value.find(
            (item): item is string => typeof item === "string" && item.trim().length > 0
          );
          if (firstFieldError) return firstFieldError;
        }
      }
    }

    const formErrors = (error as { formErrors?: unknown }).formErrors;
    if (Array.isArray(formErrors)) {
      const firstFormError = formErrors.find(
        (item): item is string => typeof item === "string" && item.trim().length > 0
      );
      if (firstFormError) return firstFormError;
    }
  }

  return fallback;
}

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email: normalizedEmail, password })
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          toast.error(getErrorMessage(payload, "Unable to create account"));
          return;
        }

        const signInResult = await signIn("credentials", {
          email: normalizedEmail,
          password,
          redirect: false
        });

        // Registration should only be considered complete once session creation succeeds.
        if (!signInResult || signInResult.error) {
          toast.error("Account created, but login failed. Please login manually.");
          router.push("/login");
          return;
        }

        toast.success("Account created");
        router.push(signInResult.url || "/");
        router.refresh();
      } catch {
        toast.error("Network error. Please check your connection and try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</label>
        <Input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Jane Cooper"
          required
        />
      </div>

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
          placeholder="Must include uppercase, number, special char"
          required
          minLength={8}
        />
      </div>

      <Button type="submit" className="w-full" loading={pending}>
        Create account
      </Button>
    </form>
  );
}
