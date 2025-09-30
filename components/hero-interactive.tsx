// components/hero-interactive.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { cn } from "@/lib/utils"
import { FileText, MessageSquare, BarChart3, Activity, Sparkles, ArrowRight, Zap } from "lucide-react"

export function HeroInteractive() {
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const [isHovered, setIsHovered] = React.useState(false)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = panelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    el.style.setProperty("--x", `${x}%`)
    el.style.setProperty("--y", `${y}%`)
  }

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-accent-2/15 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div
        ref={panelRef}
        onMouseMove={onMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "spotlight-bg relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8",
          "transition-transform duration-500",
          isHovered ? "scale-[1.01]" : "scale-100"
        )}
        aria-label="Interactive AI document platform"
      >
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Content Side */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Document Intelligence
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-balance">
                <span className="bg-gradient-to-r from-primary via-accent to-accent-2 bg-clip-text text-transparent">
                  Ask smarter
                </span>
                <br />
                <span className="text-foreground">questions about</span>
                <br />
                <span className="text-accent">your PDFs</span>
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-accent-2 rounded-full mx-auto lg:mx-0" />
            </div>

            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Transform static documents into interactive conversations. Upload, analyze, and get cited answers
              with real-time insights and performance monitoring.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link href="/documents" className="w-full sm:w-auto">
                <GradientButton className="btn-gradient flex items-center group px-8 py-4 text-lg font-semibold rounded-lg w-full sm:w-auto">
                  <span>Get Started</span>
                  {/* <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> */}
                </GradientButton>

              </Link>
              <Link href="/chat" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="group px-8 py-4 text-lg rounded-2xl border-2 border-accent/30 hover:border-accent hover:text-primary border-primary w-full sm:w-auto transition-all duration-300"
                >
                  <MessageSquare className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                  Try Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-2 rounded-full animate-pulse" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-300" />
                <span>Sub-second Response</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-600" />
                <span>Enterprise Grade</span>
              </div>
            </div>
          </div>

          {/* Interactive Cards Side */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Lightning Fast"
                desc="Process documents in milliseconds"
                gradient="from-accent-2 to-primary"
                delay="0ms"
              />
              <FeatureCard
                icon={<FileText className="w-6 h-6" />}
                title="Cited Sources"
                desc="Every answer backed by references"
                gradient="from-primary to-accent"
                delay="200ms"
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6" />}
                title="Smart Analytics"
                desc="Usage insights and performance metrics"
                gradient="from-accent to-accent-2"
                delay="400ms"
              />
              <FeatureCard
                icon={<Activity className="w-6 h-6" />}
                title="Live Monitoring"
                desc="Real-time system health tracking"
                gradient="from-accent-2 to-accent"
                delay="600ms"
              />
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl animate-float" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-accent-2/20 to-primary/20 rounded-full blur-xl animate-float delay-1000" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
  gradient,
  delay
}: {
  icon: React.ReactNode
  title: string
  desc: string
  gradient: string
  delay: string
}) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div
      className={cn(
        "group relative rounded-2xl p-0.5 transition-all duration-500 hover:scale-105 hover:-translate-y-2",
        "bg-gradient-to-br", gradient
      )}
      style={{ animationDelay: delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-[calc(theme(borderRadius.2xl)-2px)] bg-card/95 backdrop-blur-sm p-6 h-full">
        {/* Icon with gradient background */}
        <div className={cn(
          "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform duration-300",
          `bg-gradient-to-br ${gradient}`,
          isHovered ? "scale-110 rotate-6" : "scale-100"
        )}>
          <div className="text-white">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>

        {/* Hover effect overlay */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: `radial-gradient(300px circle at var(--x, 50%) var(--y, 50%), 
              color-mix(in oklch, white 8%, transparent), 
              transparent 50%)`
          }}
        />

        {/* Subtle border glow */}
        <div className={cn(
          "absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none",
          `bg-gradient-to-br ${gradient}`,
          isHovered ? "opacity-20" : "opacity-0"
        )} />
      </div>
    </div>
  )
}

