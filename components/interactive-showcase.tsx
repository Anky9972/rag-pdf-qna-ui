// components/interactive-showcase.tsx
"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function InteractiveShowcase({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 150, damping: 20, mass: 0.5 })
  const sy = useSpring(my, { stiffness: 150, damping: 20, mass: 0.5 })

  const tiltX = useTransform(sx, [0, 1], [8, -8])
  const tiltY = useTransform(sy, [0, 1], [-8, 8])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    mx.set(x)
    my.set(y)
    // apply CSS vars for spotlight
    el.style.setProperty("--x", `${x * 100}%`)
    el.style.setProperty("--y", `${y * 100}%`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        "spotlight-bg relative overflow-hidden rounded-[var(--radius)] border glass",
        "p-6 md:p-8",
        className,
      )}
    >
      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-balance">Explore with an interactive spotlight</h2>
        <p className="text-muted-foreground mt-2 text-pretty">
          Hover to reveal. Navigate quickly to core areas of the app.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.div style={{ rotateX: tiltX, rotateY: tiltY }} className="rounded-lg p-[1px] card-gradient">
            <div className="glass rounded-[calc(0.5rem-1px)] p-4">
              <div className="text-sm font-medium">Documents</div>
              <p className="text-xs text-muted-foreground">Upload & manage PDFs</p>
              <Link href="/documents" className="text-xs underline mt-2 inline-block text-primary">
                Open
              </Link>
            </div>
          </motion.div>

          <motion.div style={{ rotateX: tiltX, rotateY: tiltY }} className="rounded-lg p-[1px] card-gradient">
            <div className="glass rounded-[calc(0.5rem-1px)] p-4">
              <div className="text-sm font-medium">Chat</div>
              <p className="text-xs text-muted-foreground">Ask smarter questions</p>
              <Link href="/chat" className="text-xs underline mt-2 inline-block text-primary">
                Open
              </Link>
            </div>
          </motion.div>

          <motion.div style={{ rotateX: tiltX, rotateY: tiltY }} className="rounded-lg p-[1px] card-gradient">
            <div className="glass rounded-[calc(0.5rem-1px)] p-4">
              <div className="text-sm font-medium">Analytics</div>
              <p className="text-xs text-muted-foreground">Usage & insights</p>
              <Link href="/dashboard" className="text-xs underline mt-2 inline-block text-primary">
                Open
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
