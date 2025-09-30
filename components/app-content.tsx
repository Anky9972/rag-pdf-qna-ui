"use client"

import { useAuth } from "@/components/auth-context"
import { SiteHeader } from "@/components/site-header"
import { Loader2 } from "lucide-react"

export function AppContent({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useAuth()

  // ⏳ Block rendering until auth has finished initializing
  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        
      </div>
    )
  }

  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}
