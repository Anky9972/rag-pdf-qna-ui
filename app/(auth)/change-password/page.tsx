// app/(auth)/change-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, Check, X, CheckCircle, ArrowLeft } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Password strength checker
  const getPasswordStrength = () => {
    const checks = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    };
    
    return { checks };
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }
    
    const { checks } = getPasswordStrength();
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!checks.length) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!checks.uppercase || !checks.lowercase || !checks.number || !checks.special) {
      newErrors.newPassword = "Password must meet all requirements";
    }
    
    if (oldPassword && newPassword && oldPassword === newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success("Password changed successfully!");
        setTimeout(() => router.push("/chat"), 2000);
      } else {
        if (data.detail?.includes("incorrect") || data.detail?.includes("wrong")) {
          setErrors({ oldPassword: "Current password is incorrect" });
        } else if (data.detail?.includes("same")) {
          setErrors({ newPassword: "New password must be different from current password" });
        } else if (data.detail?.includes("unauthorized")) {
          setErrors({ general: "Session expired. Please log in again" });
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setErrors({ general: "Unable to change password. Please try again" });
        }
        toast.error(errors.general || data.detail || "Failed to change password");
      }
    } catch (error: any) {
      setErrors({ general: "Connection error. Please check your internet" });
      toast.error("Internal server error");
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (success) {
    return (
      <AuthShell
        title="Password changed!"
        subtitle="Your password has been updated successfully"
        side="right"
      >
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">All set!</h3>
            <p className="text-sm text-muted-foreground">
              Your account is now secured with your new password
            </p>
          </div>
          <GradientButton
            onClick={() => router.push("/chat")}
            className="w-full h-11 rounded-lg text-base font-semibold"
          >
            Continue to chat
          </GradientButton>
        </div>
      </AuthShell>
    );
  }

  const { checks } = getPasswordStrength();

  return (
    <AuthShell
      title="Change your password"
      subtitle="Keep your account secure with a strong password"
      side="right"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* General Error */}
        {errors.general && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">{errors.general}</p>
          </div>
        )}

        {/* Current Password */}
        <div className="space-y-2">
          <Label htmlFor="old_password" className="text-sm font-medium">
            Current password
          </Label>
          <div className="relative">
            <Input
              id="old_password"
              type={showOld ? "text" : "password"}
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (errors.oldPassword) setErrors({ ...errors, oldPassword: undefined });
              }}
              className={`h-11 rounded-lg border-border focus:ring-2 focus:ring-primary/50 pr-10 ${
                errors.oldPassword ? "border-red-500 focus:ring-red-500/50" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.oldPassword && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.oldPassword}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="new_password" className="text-sm font-medium">
            New password
          </Label>
          <div className="relative">
            <Input
              id="new_password"
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
              }}
              className={`h-11 rounded-lg border-border focus:ring-2 focus:ring-primary/50 pr-10 ${
                errors.newPassword ? "border-red-500 focus:ring-red-500/50" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Password Requirements */}
          {newPassword && (
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
          
          {errors.newPassword && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.newPassword}
            </p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <Label htmlFor="confirm_password" className="text-sm font-medium">
            Confirm new password
          </Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
              }}
              className={`h-11 rounded-lg border-border focus:ring-2 focus:ring-primary/50 pr-10 ${
                errors.confirmPassword ? "border-red-500 focus:ring-red-500/50" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Button */}
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
              Changing password...
            </span>
          ) : (
            "Change password"
          )}
        </GradientButton>
      </form>
    </AuthShell>
  );
}