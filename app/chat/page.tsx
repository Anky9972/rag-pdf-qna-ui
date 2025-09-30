// app/chat/page.tsx
"use client"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatUI } from "@/components/chat/chat-ui";
import { useAuth } from "@/components/auth-context";
export default function ChatPage() {
  const search = useSearchParams()
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;
  const pdf = search.get("pdf") || undefined
  return (
    <main className="container mx-auto px-4 py-4 ">
      <ChatUI initialPdfId={pdf} />
    </main>
  )
}
