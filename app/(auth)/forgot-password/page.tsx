// app/(auth)/forgot-password/page.tsx
"use client"

import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { GradientButton } from "@/components/ui/gradient-button"

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot your password?" subtitle="We’ll send you a reset link" side="left">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="you@example.com" autoComplete="email" />
        </div>
        <GradientButton className="w-full">Send reset link</GradientButton>
      </form>

      <div className="mt-4 text-sm">
        Remembered it?{" "}
        <Link href="/(auth)/login" className="underline text-primary">
          Log in
        </Link>
      </div>
    </AuthShell>
  )
}
