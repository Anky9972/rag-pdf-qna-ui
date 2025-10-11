// app/(auth)/token-expired/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { GradientButton } from "@/components/ui/gradient-button";
import { AlertCircle, CheckCircle, Clock, Mail } from "lucide-react";

export default function TokenExpiredPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "expired";

  const getMessage = () => {
    switch (reason) {
      case "expired":
        return {
          title: "Reset link expired",
          subtitle: "This password reset link is no longer valid",
          description: "For security reasons, password reset links expire after 1 hour. This link is no longer valid."
        };
      case "invalid":
        return {
          title: "Invalid reset link",
          subtitle: "This link is not valid",
          description: "This password reset link is invalid or has already been used. Please request a new one."
        };
      case "used":
        return {
          title: "Link already used",
          subtitle: "This reset link has been used",
          description: "This password reset link has already been used. If you need to reset your password again, please request a new link."
        };
      default:
        return {
          title: "Reset link issue",
          subtitle: "There's a problem with this link",
          description: "We couldn't verify this password reset link. Please request a new one."
        };
    }
  };

  const { title, subtitle, description } = getMessage();

  return (
    <AuthShell title={title} subtitle={subtitle} side="right">
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        {/* Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
            <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center border-2 border-white dark:border-gray-900">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-3 max-w-md">
          <h3 className="text-xl font-semibold">Link no longer valid</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Why This Happens */}
        <div className="w-full p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Why did this happen?
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span>•</span>
              <span>Reset links expire after 1 hour for security</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Links can only be used once</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>The link may have been copied incorrectly</span>
            </li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="w-full p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                What to do next?
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                Simply request a new password reset link. It's quick and secure!
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          <GradientButton
            onClick={() => router.push("/forgot-password")}
            className="w-full h-11 rounded-lg text-base font-semibold flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Request new reset link
          </GradientButton>
          
          <button
            onClick={() => router.push("/login")}
            className="w-full h-11 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
          >
            Back to login
          </button>
        </div>

        {/* Help Section */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800 w-full">
          <p className="text-xs text-muted-foreground mb-2">
            Having trouble resetting your password?
          </p>
          <button
            onClick={() => {
              // You can add contact support logic here
              window.location.href = "mailto:support@example.com?subject=Password Reset Help";
            }}
            className="text-xs font-medium text-primary hover:text-accent transition-colors underline"
          >
            Contact support for help
          </button>
        </div>
      </div>
    </AuthShell>
  );
}