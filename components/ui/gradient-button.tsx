"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = React.ComponentProps<typeof Button>

export function GradientButton({ className, children, ...props }: Props) {
  return (
    <Button
      {...props}
      className={cn(
        "btn-gradient relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.99]",
        "text-primary-foreground shadow-lg hover:shadow-xl",
        className,
      )}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-20"
        style={{
          background:
            "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(255,255,255,0.4), transparent 40%)",
        }}
      />
    </Button>
  )
}
