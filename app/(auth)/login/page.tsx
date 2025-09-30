// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: "Success", description: "Logged in successfully!" });
      router.push("/chat");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue" side="left">
      <form
        className="space-y-6"
        onSubmit={handleSubmit}
      >
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-lg border-border focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-lg border-border focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Forgot password */}
        <div className="flex items-center justify-end">
          <Link
            href="/(auth)/forgot-password"
            className="text-sm font-medium text-primary hover:text-accent transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <GradientButton
          type="submit"
          className="w-full h-11 rounded-lg text-base font-semibold"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log in"}
        </GradientButton>
      </form>

      {/* Footer */}
      <div className="mt-8 text-sm text-center text-muted-foreground">
        New here?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary hover:text-accent transition-colors"
        >
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}
