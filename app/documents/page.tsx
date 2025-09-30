// app/documents/page.tsx
"use client"
import { useState } from "react"
import { UploadPdf } from "@/components/upload-pdf"
import { DocumentsList } from "@/components/documents-list"
import { useRouter } from "next/navigation"

export default function DocumentsPage() {
  const [lastUploaded, setLastUploaded] = useState<any>(null)
  const router = useRouter()

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-muted-foreground">Upload and manage your PDFs.</p>
      </header>

      <UploadPdf
        onUploaded={(d) => {
          setLastUploaded(d)
          // Navigate to chat preselecting pdf
          router.push(`/chat?pdf=${encodeURIComponent(d?.pdf_id || "")}`)
        }}
      />

      <DocumentsList onSelect={(doc) => router.push(`/chat?pdf=${encodeURIComponent(doc?.id || "")}`)} />
    </main>
  )
}
