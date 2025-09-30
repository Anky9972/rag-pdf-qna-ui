// components/awesome-card.tsx
import type React from "react"
import { cn } from "@/lib/utils"

export function AwesomeCard({
  className,
  title,
  subtitle,
  children,
  footer,
}: {
  className?: string
  title?: string
  subtitle?: string
  children?: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative group rounded-xl p-[1px] transition-transform duration-300 hover:scale-[1.01]",
        "bg-[linear-gradient(135deg,var(--card-grad-start),var(--card-grad-end))]",
        "bg-[length:200%_200%] motion-safe:transition-[background-position] motion-safe:duration-700 group-hover:bg-[position:80%_20%]",
        className,
      )}
      style={
        {
          ["--card-grad-start" as any]: "var(--color-chart-2)",
          ["--card-grad-end" as any]: "var(--color-primary)",
        } as React.CSSProperties
      }
    >
      {/* Inner surface with glass effect */}
      <div className="rounded-[calc(0.75rem-1px)] glass p-5">
        {(title || subtitle) && (
          <div className="mb-3">
            {title && <h3 className="text-pretty text-lg font-semibold text-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-foreground/70">{subtitle}</p>}
          </div>
        )}
        <div className="text-foreground">{children}</div>
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  )
}
