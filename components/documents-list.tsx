// components/documents-list.tsx
"use client";

import useSWR from "swr";
import { AnimatedCard } from "./animated-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-context";
import {
  FileText,
  Trash2,
  MessageSquare,
  Calendar,
  HardDrive,
  FileIcon,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Download,
  Eye,
  MoreVertical,
  Search,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Upload,
  ArrowRight,
  Clock,
  Star,
  Zap
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import path from "path";

interface DocumentsListProps {
  onSelect?: (doc: any) => void;
  layout?: 'responsive' | 'chat' | 'full';
  showHeader?: boolean;
  showSearch?: boolean;
  showViewToggle?: boolean;
  maxHeight?: string;
}

export function DocumentsList({
  onSelect,
  layout = 'responsive',
  showHeader = true,
  showSearch = true,
  showViewToggle = true,
  maxHeight = 'none'
}: DocumentsListProps) {
  const { toast } = useToast();
  const pathname = usePathname();
  const { user, isLoading: authLoading, isInitialized, fetchUser } = useAuth();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    layout === 'chat' ? 'list' : (pathname === '/chat' ? 'list' : 'grid')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  //get /chat in variable
  console.log("Current pathname:", pathname);

  // Debug logging
  console.log("🔍 DocumentsList render:", {
    hasUser: !!user,
    isInitialized,
    authLoading,
    userId: user?.id,
    username: user?.username,
    layout
  });

  // Create authenticated fetcher using cookies
  const authenticatedFetcher = async (url: string) => {
    if (!user || !isInitialized) {
      throw new Error("Not authenticated - user not logged in");
    }

    console.log("📤 Making authenticated request to:", url);
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("📥 Response status:", response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 401) {
        console.error("🔒 Got 401 - authentication failed");
        throw new Error("Authentication expired. Please log in again.");
      }

      const errorText = await response.text();
      console.error("❌ Request failed:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData?.detail || `HTTP ${response.status}: ${response.statusText}`);
      } catch (parseError) {
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
    }

    const data = await response.json();
    console.log("✅ Request successful, got", data?.length, "documents");
    return data;
  };

  const shouldFetch = isInitialized && !!user && !authLoading;

  const { data, isLoading, error, mutate } = useSWR(
    shouldFetch ? "/api/documents?limit=50&offset=0" : null,
    authenticatedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      errorRetryCount: 0,
      onError: (error) => {
        console.error("DocumentsList SWR Error:", error);
        if (error.message.includes("Authentication expired") || error.message.includes("401")) {
          toast({
            title: "Authentication Error",
            description: "Please log in again.",
            variant: "destructive"
          });
        }
      }
    }
  );

  async function handleDelete(id: string, filename: string) {
    if (!user || !isInitialized) {
      toast({
        title: "Error",
        description: "Please log in to delete documents.",
        variant: "destructive"
      });
      return;
    }

    const ok = confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`);
    if (!ok) return;

    setDeletingIds(prev => new Set(prev).add(id));

    try {
      console.log("🗑️ Deleting document:", id);
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("📥 Delete response:", res.status, res.statusText);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Authentication expired. Please log in again.");
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to delete document");
      }

      await mutate();
      toast({
        title: "Document deleted",
        description: `"${filename}" has been successfully deleted.`
      });
    } catch (e: any) {
      console.error("Delete error:", e);
      toast({
        title: "Delete failed",
        description: e.message || "Failed to delete document",
        variant: "destructive"
      });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  function getFileTypeColor(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'from-red-500 to-red-600';
      case 'doc':
      case 'docx': return 'from-blue-500 to-blue-600';
      case 'txt': return 'from-gray-500 to-gray-600';
      default: return 'from-primary to-primary/80';
    }
  }

  // Filter and sort documents
  const filteredAndSortedData = data
    ?.filter((doc: any) =>
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )
    ?.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name':
          return a.filename.localeCompare(b.filename);
        case 'size':
          return (b.file_size || 0) - (a.file_size || 0);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    }) || [];

  // Determine the layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'chat':
        return {
          container: 'flex flex-col h-full',
          content: `flex-1 overflow-y-auto ${maxHeight !== 'none' ? `max-h-[${maxHeight}]` : ''}`,
          grid: 'flex flex-col space-y-3',
          forceListView: true
        };
      case 'full':
        return {
          container: 'space-y-6',
          content: '',
          grid: viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "flex flex-col space-y-3",
          forceListView: false
        };
      case 'responsive':
      default:
        return {
          container: 'flex flex-col space-y-4',
          content: `flex-1 ${maxHeight !== 'none' ? `max-h-[${maxHeight}] overflow-y-auto` : ''}`,
          grid: viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "flex flex-col space-y-3",
          forceListView: false
        };
    }
  };

  const layoutClasses = getLayoutClasses();
  const effectiveViewMode = layoutClasses.forceListView ? 'list' : viewMode;

  // Show loading while auth is initializing
  if (!isInitialized || authLoading) {
    return (
      <div className={`flex items-center justify-center ${layout === 'chat' ? 'py-8' : 'py-12'}`}>
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-t-primary/50 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div>
            <h3 className={`font-medium ${layout === 'chat' ? 'text-sm' : 'text-base'} mb-1`}>Loading documents</h3>
            <p className="text-xs text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (!user) {
    return (
      <div className={`text-center ${layout === 'chat' ? 'py-8' : 'py-12'} space-y-4`}>
        <div className="relative">
          <div className={`${layout === 'chat' ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mx-auto shadow-sm`}>
            <AlertCircle className={`${layout === 'chat' ? 'w-6 h-6' : 'w-8 h-8'} text-muted-foreground`} />
          </div>
        </div>
        <div>
          <h3 className={`font-semibold ${layout === 'chat' ? 'text-base' : 'text-lg'} mb-2`}>Authentication Required</h3>
          <p className={`text-muted-foreground mb-4 ${layout === 'chat' ? 'text-xs' : 'text-sm'}`}>Please log in to access your documents.</p>
          {layout !== 'chat' && (
            <Button className="gap-2 shadow-sm hover:shadow-md transition-all">
              <ArrowRight className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show loading skeleton while fetching documents
  if (isLoading) {
    return (
      <div className={layoutClasses.container}>
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="animate-pulse h-4 bg-muted rounded w-32"></div>
            <div className="animate-pulse h-8 bg-muted rounded w-20"></div>
          </div>
        )}

        {showSearch && (
          <div className="flex gap-3">
            <div className="animate-pulse h-10 bg-muted rounded flex-1"></div>
            {showViewToggle && !layoutClasses.forceListView && (
              <>
                <div className="animate-pulse h-10 bg-muted rounded w-24"></div>
                <div className="animate-pulse h-10 bg-muted rounded w-20"></div>
              </>
            )}
          </div>
        )}

        <div className={layoutClasses.content}>
          <div className="flex flex-col space-y-3">
            {[...Array(layout === 'chat' ? 3 : 6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className={`h-${layout === 'chat' ? '16' : '20'} bg-muted rounded-xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className={`text-center ${layout === 'chat' ? 'py-8' : 'py-12'} space-y-4`}>
        <div className="relative">
          <div className={`${layout === 'chat' ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-2xl flex items-center justify-center mx-auto`}>
            <AlertCircle className={`${layout === 'chat' ? 'w-6 h-6' : 'w-8 h-8'} text-destructive`} />
          </div>
        </div>
        <div>
          <h3 className={`font-semibold ${layout === 'chat' ? 'text-sm' : 'text-lg'} text-destructive mb-2`}>Failed to load</h3>
          <p className={`text-muted-foreground mb-4 ${layout === 'chat' ? 'text-xs max-w-xs' : 'text-sm max-w-md'} mx-auto`}>
            {error.message}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size={layout === 'chat' ? 'sm' : 'default'}
              onClick={() => mutate()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {layout === 'chat' ? 'Retry' : 'Try Again'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no documents
  if (!data?.length) {
    return (
      <div className={`text-center ${layout === 'chat' ? 'py-8' : 'py-12'} space-y-4`}>
        <div className="relative">
          <div className={`${layout === 'chat' ? 'w-14 h-14' : 'w-20 h-20'} bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl flex items-center justify-center mx-auto shadow-sm`}>
            <FileText className={`${layout === 'chat' ? 'w-7 h-7' : 'w-10 h-10'} text-primary`} />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
        <div className={`${layout === 'chat' ? 'max-w-xs' : 'max-w-md'} mx-auto`}>
          <h3 className={`font-semibold ${layout === 'chat' ? 'text-base' : 'text-xl'} mb-2`}>
            {layout === 'chat' ? 'No documents' : 'Ready to get started?'}
          </h3>
          <p className={`text-muted-foreground ${layout === 'chat' ? 'text-xs mb-4' : 'text-sm mb-6'}`}>
            {layout === 'chat'
              ? 'Upload a PDF document to start chatting with AI.'
              : 'Upload your first PDF document and unlock AI-powered conversations. Get instant answers, summaries, and insights from your documents.'
            }
          </p>
          {layout !== 'chat' && (
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all">
              <Upload className="w-4 h-4" />
              Upload Your First Document
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render documents list
  return (
    <div className={layoutClasses.container}>
      {/* Header with stats */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className={`font-semibold ${layout === 'chat' ? 'text-base' : 'text-lg'}`}>
                {layout === 'chat' ? 'Documents' : 'Your Documents'}
              </h2>
              <p className={`text-muted-foreground ${layout === 'chat' ? 'text-xs' : 'text-sm'}`}>
                {filteredAndSortedData.length} of {data.length} document{data.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          </div>
          {layout !== 'chat' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => mutate()}
              className="gap-2 hover:bg-primary/5"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          )}
        </div>
      )}

      {/* Search and filters */}
      {showSearch && (
        <div className={`flex ${layout === 'chat' ? 'flex-col gap-2' : 'flex-col sm:flex-row gap-3'}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={layout === 'chat' ? 'Search...' : 'Search documents...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 ${layout === 'chat' ? 'py-1.5 text-sm' : 'py-2'} border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
            />
          </div>

          {showViewToggle && !layoutClasses.forceListView && (
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-3 ${layout === 'chat' ? 'py-1.5 text-sm' : 'py-2'} border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
              >
                <option value="date">Latest</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>

              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0 border-l"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documents grid/list */}
      <div className={`${layoutClasses.content}${pathname === '/chat' ? 'overflow-y-auto max-h-[calc(100vh-420px)] px-2' : ''}`}
      style={{scrollbarColor: 'rgba(100, 100, 100, 0.5) transparent', scrollbarWidth: 'thin', scrollbarGutter: 'stable' }}
      >
        <div className={layoutClasses.grid}>
          {filteredAndSortedData.map((doc: any) => (
            <AnimatedCard
              key={doc.id}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border-2 hover:border-primary/20"
            >
              {effectiveViewMode === 'grid' && !layoutClasses.forceListView ? (
                // Grid view
                <div className="relative">
                  {/* Document preview/header */}
                  <div className={`h-36 bg-gradient-to-br ${getFileTypeColor(doc.filename)} relative overflow-hidden`}>
                    <img
                      src={
                        doc.filename.split('.').pop()?.toLowerCase() === "pdf"
                          ? "/pdf-back.jpg"
                          : doc.filename.split('.').pop()?.toLowerCase() === "doc" || doc.filename.split('.').pop()?.toLowerCase() === "docx"
                            ? "/docx-bg.png"
                            : "/txt-bg.png"
                      }
                      alt="error"
                      className="w-full h-auto"
                    />

                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-2 left-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <FileIcon className="w-3 h-3 text-white" />
                      </div>
                      <div className="text-white text-xs font-medium opacity-90">PDF</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <div className="mb-3">
                      <h4 className="font-semibold text-sm truncate mb-1 group-hover:text-primary transition-colors">
                        {doc.filename}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {formatFileSize(doc.file_size || 0)}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {doc.page_count ?? "?"} pages
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(doc.created_at)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => onSelect?.(doc)}
                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white gap-2 text-xs h-7 shadow-sm hover:shadow-md transition-all"
                      >
                        <Zap className="w-3 h-3" />
                        Chat
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc.id, doc.filename)}
                        disabled={deletingIds.has(doc.id)}
                        className="gap-1 text-xs h-7 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                      >
                        {deletingIds.has(doc.id) ? (
                          <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // List view (default for chat layout)
                <div className={`flex  gap-3 ${pathname === '/chat' ? 'p-3 ' : 'p-4 items-center'}`}>
                  <div className={`${pathname === '/chat' ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br ${getFileTypeColor(doc.filename)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <FileIcon className={`${layout === 'chat' ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold ${pathname === 'chat' ? 'text-sm' : 'text-sm'} truncate mb-1 group-hover:text-primary transition-colors`}>
                      {doc.filename}
                    </h4>

                    <div className={`flex items-center ${pathname === '/chat' ? 'gap-2' : 'gap-4'} text-xs text-muted-foreground`}>
                      <div className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatFileSize(doc.file_size || 0)}
                      </div>

                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {doc.page_count ?? "?"} pages
                      </div>

                      {layout !== 'chat' && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(doc.created_at)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 flex-shrink-0 ${pathname === '/chat' ? 'flex-col' : ''}`}>
                    <Button
                      onClick={() => onSelect?.(doc)}
                      className={`bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white gap-2 text-xs ${layout === 'chat' ? 'px-3 h-7' : 'px-4 h-8'} shadow-sm hover:shadow-md transition-all`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      {pathname === '/chat' ? '' : 'Chat'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.filename)}
                      disabled={deletingIds.has(doc.id)}
                      className={`gap-1 text-xs ${layout === 'chat' ? 'h-7' : 'h-8'} hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20`}
                    >
                      {deletingIds.has(doc.id) ? (
                        <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* Footer */}
      {layout !== 'chat' && (
        <div className="text-center pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary/70" />
            Select any document to start an AI-powered conversation
          </p>
        </div>
      )}
    </div>
  );
}