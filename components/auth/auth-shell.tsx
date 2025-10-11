// components/auth/auth-shell.tsx
import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="relative container mx-auto px-4 py-16 spotlight-bg">
      <div className="flex justify-center">
        <div className="w-full max-w-md rounded-2xl border glass p-8 md:p-10 shadow-xl">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent brand-gradient">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-muted-foreground text-base leading-relaxed">
                {subtitle}
              </p>
            ) : null}
            {children}
          </div>
          {footer ? <div className="mt-8">{footer}</div> : null}
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground mt-10">
        <Link
          href="/"
          className="inline-block px-3 py-1 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  )
}
