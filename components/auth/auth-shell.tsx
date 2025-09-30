// components/auth/auth-shell.tsx
import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function AuthShell({
  title,
  subtitle,
  side = "left",
  children,
  footer,
}: {
  title: string
  subtitle?: string
  side?: "left" | "right"
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const sideBlock = (
    <div className="hidden md:flex relative p-[1px] rounded-2xl card-gradient shadow-xl animate-float">
      <div className="glass rounded-2xl p-10 w-full h-full flex items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent brand-gradient">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-muted-foreground text-base leading-relaxed">
              {subtitle}
            </p>
          ) : null}
          <div className="text-sm text-foreground/80 leading-relaxed">
            <ul className="list-disc ml-5 space-y-2 marker:text-accent">
              <li>Blue → Teal gradients with subtle glass surfaces</li>
              <li>Responsive and accessible forms</li>
              <li>No vendor lock-in for auth wiring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <main className="relative container mx-auto px-4 py-16 spotlight-bg">
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-10 items-center",
          side === "left" ? "" : "md:[&>div:first-child]:col-start-2"
        )}
      >
        {side === "left" ? sideBlock : null}

        <div className="rounded-2xl border glass p-8 md:p-10 shadow-xl">
          <div className="space-y-6">{children}</div>
          {footer ? <div className="mt-8">{footer}</div> : null}
        </div>

        {side === "right" ? sideBlock : null}
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
