// app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success("Reset link sent! Check your email.");
      } else {
        if (data.detail?.includes("not found") || data.detail?.includes("doesn't exist")) {
          setError("No account found with this email address");
        } else if (data.detail?.includes("rate limit")) {
          setError("Too many requests. Please try again later");
        } else {
          setError("Unable to send reset link. Please try again");
        }
        toast.error(error || "Failed to send reset link");
      }
    } catch {
      setError("Unable to connect. Please check your internet connection");
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We've sent you a password reset link"
        side="left"
      >
        <div className="space-y-6">
          {/* Success Message */}
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Email sent successfully!</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">What's next?</p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                  <li>• Check your inbox (and spam folder)</li>
                  <li>• Click the reset link in the email</li>
                  <li>• Create your new password</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Resend Option */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?{" "}
              <button
                onClick={() => setSuccess(false)}
                className="font-medium text-primary hover:text-accent transition-colors"
              >
                Try again
              </button>
            </p>
          </div>

          {/* Back to Login */}
          <div className="text-center pt-4">
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="No worries, we'll send you reset instructions"
      side="left"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            className={`h-11 rounded-lg border-border focus:ring-2 focus:ring-primary/50 ${
              error ? "border-red-500 focus:ring-red-500/50" : ""
            }`}
          />
          <p className="text-xs text-muted-foreground">
            Enter the email you used to sign up
          </p>
        </div>

        {/* Submit Button */}
        <GradientButton
          type="submit"
          className="w-full h-11 rounded-lg text-base font-semibold"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </span>
          ) : (
            "Send reset link"
          )}
        </GradientButton>
      </form>

      {/* Footer */}
      <div className="mt-8 text-sm text-center text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-accent transition-colors"
        >
          Log in
        </Link>
      </div>
    </AuthShell>
  );
}