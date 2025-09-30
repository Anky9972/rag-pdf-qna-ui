// app/(auth)/reset-password/page.tsx
"use client"

import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { GradientButton } from "@/components/ui/gradient-button"

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="Choose a new strong password" side="right">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" required autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" required autoComplete="new-password" />
        </div>
        <GradientButton className="w-full">Reset password</GradientButton>
      </form>

      <div className="mt-4 text-sm">
        Back to{" "}
        <Link href="/(auth)/login" className="underline text-primary">
          Log in
        </Link>
      </div>
    </AuthShell>
  )
}
