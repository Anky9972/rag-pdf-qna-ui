// components/animated-card.tsx
"use client"
import { motion } from "framer-motion"
import type React from "react"

import { cn } from "@/lib/utils"

type AnimatedCardProps = React.PropsWithChildren<{
  className?: string
}>

export function AnimatedCard({ className, children }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ y: 12, opacity: 0.0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.8 }}
      className={cn(
        "rounded-[var(--radius)] border bg-card text-card-foreground shadow-sm",
        "border-[color:var(--muted-contrast)]/10",
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
