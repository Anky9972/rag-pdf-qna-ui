"use client"

import { useEffect, useMemo, useState } from "react"
import { Laptop, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type ThemeMode = "light" | "dark" | "system"

function getSystemPref(): ThemeMode {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  const resolved = mode === "system" ? getSystemPref() : mode
  if (resolved === "dark") root.classList.add("dark")
  else root.classList.remove("dark")
  localStorage.setItem("theme-mode", mode)
}

const iconFor = (mode: ThemeMode) => {
  switch (mode) {
    case "light":
      return <Sun className="h-4 w-4" />
    case "dark":
      return <Moon className="h-4 w-4" />
    default:
      return <Laptop className="h-4 w-4" />
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>("system")

  useEffect(() => {
    const saved = (localStorage.getItem("theme-mode") as ThemeMode) || "system"
    setMode(saved)
    applyTheme(saved)
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const current = (localStorage.getItem("theme-mode") as ThemeMode) || "system"
      if (current === "system") applyTheme("system")
    }
    mq.addEventListener?.("change", onChange)
    return () => mq.removeEventListener?.("change", onChange)
  }, [])

  const items = useMemo(
    () => [
      { k: "light" as ThemeMode, label: "Light" },
      { k: "dark" as ThemeMode, label: "Dark" },
      { k: "system" as ThemeMode, label: "System" },
    ],
    [],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Toggle theme"
          variant="outline"
          size="icon"
          className={cn("relative transition-all btn-gradient/[[data-open]]:opacity-95", className)}
        >
          {iconFor(mode)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={(val) => {
            const v = val as ThemeMode
            setMode(v)
            applyTheme(v)
          }}
        >
          {items.map((it) => (
            <DropdownMenuRadioItem key={it.k} value={it.k}>
              <div className="flex items-center gap-2">
                {iconFor(it.k)}
                <span>{it.label}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
