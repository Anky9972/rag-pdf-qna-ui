// components/auth-context.tsx (Cookie-Based Version)
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserResponse } from "@/app/api/types";

interface AuthContextType {
  user: UserResponse | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  fetchUser: () => Promise<void>;
  isLoading: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session on mount by checking /api/auth/me
  useEffect(() => {
    console.log("🚀 Initializing auth from server...");
    const init = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Send httpOnly cookie
        });
        console.log("📥 Initial fetch user response:", {
          status: res.status,
          ok: res.ok,
          statusText: res.statusText,
        });

        if (res.ok) {
          const data: UserResponse = await res.json();
          console.log("✅ Session restored:", {
            id: data.id,
            username: data.username,
            email: data.email,
          });
          setUser(data);
        } else {
          console.log("⚠️ No active session found");
          setUser(null);
        }
      } catch (err) {
        console.error("💥 Auth init failed:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.log("🏁 Initialization completed:", { isInitialized: true });
      }
    };
    init();
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log("🔐 AuthProvider State:", {
      hasUser: !!user,
      isLoading,
      isInitialized,
      userId: user?.id,
      username: user?.username,
    });
  }, [user, isLoading, isInitialized]);

  // Handle invalid session (e.g., 401 responses)
  const handleInvalidSession = useCallback(() => {
    console.log("❌ Handling invalid session - clearing auth state");
    setUser(null);
    setIsLoading(false);
  }, []);

  // Fetch user data (used for manual refresh or after login/signup)
  const fetchUser = useCallback(async () => {
    console.log("🔄 fetchUser called");
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });
      console.log("📥 Fetch user response:", {
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Fetch user error:", errorText);
        if (res.status === 401) {
          console.warn("🔒 Session invalid or expired (401)");
          handleInvalidSession();
          return;
        }
        throw new Error(errorText || "Failed to fetch user");
      }

      const data: UserResponse = await res.json();
      console.log("✅ User fetched successfully:", {
        id: data.id,
        username: data.username,
        email: data.email,
      });
      setUser(data);
    } catch (error: any) {
      console.error("💥 Fetch user error:", error);
      handleInvalidSession();
    } finally {
      setIsLoading(false);
      console.log("🏁 User fetch completed");
    }
  }, [handleInvalidSession]);

  // Login: Send credentials, let server set httpOnly cookie
  const login = useCallback(async (email: string, password: string) => {
    console.log("🔐 Attempting login for:", email);
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Ensure cookie is set
      });
      console.log("📥 Login response:", {
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Login error:", errorText);
        throw new Error(errorText || "Login failed");
      }

      const data: UserResponse = await res.json();
      console.log("✅ Login successful:", {
        id: data.id,
        username: data.username,
        email: data.email,
      });
      setUser(data);
    } catch (error: any) {
      console.error("💥 Login failed:", error);
      handleInvalidSession();
      throw new Error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }, [handleInvalidSession]);

  // Signup: Send credentials, let server set httpOnly cookie
  const signup = useCallback(async (username: string, email: string, password: string) => {
    console.log("📝 Attempting signup for:", { username, email });
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
        credentials: "include", // Ensure cookie is set
      });
      console.log("📥 Signup response:", {
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Signup error:", errorText);
        throw new Error(errorText || "Signup failed");
      }

      const data: UserResponse = await res.json();
      console.log("✅ Signup successful:", {
        id: data.id,
        username: data.username,
        email: data.email,
      });
      setUser(data);
    } catch (error: any) {
      console.error("💥 Signup failed:", error);
      handleInvalidSession();
      throw new Error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  }, [handleInvalidSession]);

  // Logout: Clear server session and local state
  const logout = useCallback(async () => {
    console.log("🚪 Attempting logout...");
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Send cookie to clear server session
      });
      console.log("📥 Logout response:", {
        status: res.status,
        ok: res.ok,
      });

      if (!res.ok) {
        console.warn("⚠️ Logout request failed, but clearing local state anyway");
      } else {
        console.log("✅ Server logout successful");
      }
    } catch (error: any) {
      console.warn("⚠️ Logout error (continuing anyway):", error);
    } finally {
      console.log("🧹 Clearing local auth state...");
      handleInvalidSession();
    }
  }, [handleInvalidSession]);

  // Refresh session (if server supports it)
  const refreshSession = useCallback(async () => {
    console.log("🔄 Attempting session refresh...");
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Send cookie
      });
      console.log("📥 Refresh response:", {
        status: res.status,
        ok: res.ok,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Session refresh failed:", errorText);
        if (res.status === 401) {
          console.log("🔒 Session refresh failed with 401 - clearing auth");
          handleInvalidSession();
          throw new Error("Session refresh failed - please log in again");
        }
        throw new Error(errorText || "Session refresh failed");
      }

      const data: UserResponse = await res.json();
      console.log("✅ Session refreshed successfully:", {
        id: data.id,
        username: data.username,
        email: data.email,
      });
      setUser(data);
    } catch (error: any) {
      console.error("💥 Session refresh error:", error);
      handleInvalidSession();
      throw new Error(error.message || "Session refresh failed");
    } finally {
      setIsLoading(false);
    }
  }, [handleInvalidSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        refreshSession,
        fetchUser,
        isLoading,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}