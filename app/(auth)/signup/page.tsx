// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-context";
import { AlertCircle, Eye, EyeOff, Check, X } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password strength checker
  const getPasswordStrength = () => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    return { checks, strength: passed };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    const { checks } = getPasswordStrength();
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!checks.length) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!checks.uppercase || !checks.lowercase || !checks.number || !checks.special) {
      newErrors.password = "Password must meet all requirements below";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await signup(username, email, password);
      
      // Update profile with first and last name
      const profileRes = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          profile_updates: { firstName, lastName },
        }),
      });
      
      if (!profileRes.ok) {
        console.warn("Profile update failed, but signup succeeded");
      }
      
      toast({ 
        title: "Account created!", 
        description: "Welcome! Your account has been created successfully." 
      });
      router.push("/chat");
    } catch (error: any) {
      const errorMessage = error.message || "Signup failed";
      
      if (errorMessage.includes("already exists") || errorMessage.includes("taken")) {
        if (errorMessage.toLowerCase().includes("email")) {
          setErrors({ email: "This email is already registered" });
        } else {
          setErrors({ username: "This username is already taken" });
        }
      } else if (errorMessage.includes("invalid")) {
        setErrors({ general: "Please check your information and try again" });
      } else {
        setErrors({ general: "Unable to create account. Please try again later." });
      }
      
      toast({
        title: "Signup failed",
        description: errors.general || errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const { checks, strength } = getPasswordStrength();

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start chatting with your PDFs"
      side="right"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* General Error */}
        {errors.general && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">{errors.general}</p>
          </div>
        )}

        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First name
            </Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11 rounded-lg border-border focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last name
            </Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11 rounded-lg border-border focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Username <span className="text-red-500">*</span>
          </Label>
          <Input
            id="username"
            placeholder="yourusername"
            autoComplete="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors({ ...errors, username: undefined });
            }}
            className={`h-11 rounded-lg border-border focus:ring-2 focus:ring-primary/50 ${
              errors.username ? "border-red-500 focus:ring-red-500/50" : ""
            }`}
          />
          {errors.username && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.username}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`h-11 rounded-lg border-border focus:ring-2 focus:ring-primary/50 ${
              errors.email ? "border-red-500 focus:ring-red-500/50" : ""
            }`}
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              className={`h-11 rounded-lg border-border focus:ring-2 focus:ring-primary/50 pr-10 ${
                errors.password ? "border-red-500 focus:ring-red-500/50" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Password Requirements */}
          {password && (
            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Password requirements:
              </p>
              <div className="space-y-1">
                {[
                  { key: 'length', label: 'At least 8 characters' },
                  { key: 'uppercase', label: 'One uppercase letter' },
                  { key: 'lowercase', label: 'One lowercase letter' },
                  { key: 'number', label: 'One number' },
                  { key: 'special', label: 'One special character' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    {checks[key as keyof typeof checks] ? (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={checks[key as keyof typeof checks] ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <GradientButton
          type="submit"
          className="w-full h-11 rounded-lg text-base font-semibold"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            "Sign up"
          )}
        </GradientButton>
      </form>

      {/* Footer */}
      <div className="mt-8 text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-accent transition-colors"
        >
          Log in
        </Link>
      </div>
    </AuthShell>
  );
}