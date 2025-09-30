// app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { AnimatedCard } from "@/components/animated-card";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [expertise, setExpertise] = useState("intermediate");
  const [style, setStyle] = useState("concise");
  const [saving, setSaving] = useState(false);

  // 🔹 Sync state when user data is available
  useEffect(() => {
    if (user?.profile) {
      setExpertise(user.profile.expertise_level || "intermediate");
      setStyle(user.profile.response_style || "concise");
    }
  }, [user]);

  async function save() {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to update your profile.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile_updates: {
            expertise_level: expertise,
            response_style: style,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) {
          await logout();
          router.push("/login");
          throw new Error("Session expired. Redirecting to login.");
        }
        throw new Error(err?.detail || "Failed to update profile");
      }

      const data = await res.json();
      toast({
        title: "Profile updated",
        description: `Style: ${style}, Expertise: ${expertise}`,
      });
    } catch (e: any) {
      console.error("Profile update error:", e);
      toast({
        title: "Save failed",
        description: e.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  // 🔹 Guest view
  if (!user) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">
            Please log in to access your settings.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-sm hover:shadow"
          >
            Sign In
          </Button>
        </div>
      </main>
    );
  }

  // 🔹 Logged-in view
  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Tune your assistant response style and expertise level.
        </p>
      </header>

      <AnimatedCard className="p-6 border-2 border-border/50 hover:border-primary/20 transition-all duration-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expertise Level */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Expertise Level
            </label>
            <Select
              value={expertise}
              onValueChange={setExpertise}
              disabled={saving}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose expertise level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Response Style */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Response Style
            </label>
            <Select value={style} onValueChange={setStyle} disabled={saving}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose response style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="structured">Structured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <Button
            onClick={save}
            disabled={saving}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-sm hover:shadow"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Saving...
              </span>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </AnimatedCard>
    </main>
  );
}
