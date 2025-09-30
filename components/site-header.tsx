// components/site-header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth-context";
import { 
  Menu, 
  X, 
  Upload, 
  MessageSquare, 
  FileText,
  BarChart3,
  Settings,
  Activity,
  TrendingUp,
  Home,
  User,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Analytics", icon: BarChart3 },
  { href: "/monitoring", label: "Monitoring", icon: Activity },
  // { href: "/metrics", label: "Metrics", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, logout, isInitialized } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl border-border/50 shadow-lg shadow-black/5" 
          : "bg-background/95 backdrop-blur-sm border-border/30"
      )}
    >
      <div className=" mx-auto px-4 sm:px-6 lg:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo with enhanced styling */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-80 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent group-hover:from-primary/90 group-hover:to-primary transition-all duration-200">
              PDF Q&A
            </span>
            <div className="text-xs text-muted-foreground/70 font-medium tracking-wide">
              AI Assistant
            </div>
          </div>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-muted/30 rounded-xl p-1 backdrop-blur-sm border border-border/50">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "text-primary bg-background shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-transform group-hover:scale-110",
                  isActive ? "text-primary" : "text-muted-foreground/70"
                )} />
                <span>{link.label}</span>
                {isActive && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu for medium screens */}
        <nav className="hidden md:flex lg:hidden items-center gap-1">
          {links.slice(0, 4).map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative p-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
                aria-current={isActive ? "page" : undefined}
                title={link.label}
              >
                <Icon className="h-4 w-4" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden relative"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <div className="relative">
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 transition-transform rotate-90" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </div>
        </Button>

        {/* Enhanced Right Section (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isInitialized ? (
            user ? (
              <div className="flex items-center gap-3">
                {/* User Info */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground/90 truncate max-w-[120px]">
                    {user.username || user.email}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Link href="/documents">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </Link>
                  
                  <Link href="/chat">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-accent text-accent-foreground hover:bg-accent/80 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                >
                  Sign In
                </Button>
              </Link>
            )
          ) : (
            <div className="flex items-center gap-3">
              <div className="animate-pulse h-6 w-6 bg-muted rounded-full" />
              <div className="animate-pulse h-8 w-20 bg-muted rounded-lg" />
              <div className="animate-pulse h-8 w-16 bg-muted rounded-lg" />
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/10">
          <div className="p-4">
            {/* Mobile Navigation Links */}
            <nav className="space-y-1 mb-4">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-primary bg-primary/10 shadow-sm ring-1 ring-primary/20"
                        : "text-foreground hover:text-primary hover:bg-primary/5"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={cn(
                      "h-4 w-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span>{link.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Section */}
            {isInitialized && user && (
              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {user.username || user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">Signed in</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href="/documents" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full justify-center bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </Link>
                  <Link href="/chat" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="secondary"
                      className="w-full justify-center bg-accent text-accent-foreground hover:bg-accent/80"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </Link>
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-center hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}

            {isInitialized && !user && (
              <div className="pt-4 border-t border-border/50">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center hover:bg-primary/10 hover:text-primary"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}