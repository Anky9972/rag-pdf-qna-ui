// components/documents/documents.tsx
"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "../animated-card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-context";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Eye, 
  Download,
  Calendar, 
  HardDrive,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Plus
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

type Document = {
  id: string;
  filename: string;
  file_size: number;
  page_count: number;
  created_at: string;
  metadata: Record<string, any>;
};

type SortOption = 'name' | 'date' | 'size';
type ViewMode = 'grid' | 'list';

export function Documents() {
  const { toast } = useToast();
  const { token, isLoading: authLoading, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Create authenticated fetcher
  const authenticatedFetcher = async (url: string) => {
    if (!token) {
      throw new Error("Not authenticated");
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 401) {
        throw new Error("Authentication expired. Please log in again.");
      }
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData?.detail || `HTTP ${response.status}: ${response.statusText}`);
      } catch (parseError) {
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
    }
    
    const data = await response.json();
    return data;
  };

  const shouldFetch = !authLoading && !!token;
  
  const { 
    data: documents, 
    mutate: refreshDocuments, 
    error: fetchError,
    isLoading: documentsLoading 
  } = useSWR<Document[]>(
    shouldFetch ? "/api/documents?limit=100&offset=0" : null,
    authenticatedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      onError: (error) => {
        console.error("Documents SWR Error:", error);
        if (error.message.includes("Authentication expired")) {
          toast({ 
            title: "Authentication Error", 
            description: "Please log in again.", 
            variant: "destructive" 
          });
        }
      }
    }
  );

  // Filter and sort documents
  const filteredAndSortedDocs = documents?.filter(doc =>
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.filename.localeCompare(b.filename);
        break;
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'size':
        comparison = a.file_size - b.file_size;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  }) || [];

  async function deleteDocument(documentId: string, filename: string) {
    if (!token) {
      toast({ 
        title: "Error", 
        description: "Please log in to delete documents.", 
        variant: "destructive" 
      });
      return;
    }

    const ok = confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`);
    if (!ok) return;

    setDeletingIds(prev => new Set(prev).add(documentId));

    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Authentication expired. Please log in again.");
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to delete document");
      }
      
      await refreshDocuments();
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
        newSet.delete(documentId);
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
    return date.toLocaleString();
  }

  function toggleSort(option: SortOption) {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('desc');
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Document Library</h2>
              <p className="text-muted-foreground">Please log in to view and manage your documents.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Document Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your PDF documents for AI conversations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2">
            <Plus className="w-4 h-4" />
            Upload New
          </Button>
        </div>
      </div>

      {/* Search and Controls */}
      <AnimatedCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={sortBy === 'name' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => toggleSort('name')}
                className="gap-1"
              >
                Name
                {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
              </Button>
              <Button
                variant={sortBy === 'date' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => toggleSort('date')}
                className="gap-1"
              >
                Date
                {sortBy === 'date' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
              </Button>
              <Button
                variant={sortBy === 'size' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => toggleSort('size')}
                className="gap-1"
              >
                Size
                {sortBy === 'size' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
              </Button>
            </div>
            
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshDocuments()}
              className="gap-1"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {documents && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAndSortedDocs.length} of {documents.length} documents
            </p>
            <p className="text-sm text-muted-foreground">
              Total storage: {formatFileSize(documents.reduce((acc, doc) => acc + doc.file_size, 0))}
            </p>
          </div>
        )}
      </AnimatedCard>

      {/* Documents Grid/List */}
      <AnimatedCard className="p-6">
        {documentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground">Loading your documents...</p>
            </div>
          </div>
        ) : fetchError ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <p className="text-destructive font-medium mb-2">Failed to load documents</p>
              <p className="text-sm text-muted-foreground mb-4">{fetchError.message}</p>
              <Button 
                variant="outline" 
                onClick={() => refreshDocuments()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </div>
        ) : filteredAndSortedDocs.length === 0 ? (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerm 
                  ? `No documents match "${searchTerm}". Try adjusting your search.`
                  : 'Upload your first PDF document to start having AI-powered conversations.'
                }
              </p>
            </div>
            {!searchTerm && (
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2">
                <Upload className="w-4 h-4" />
                Upload Your First Document
              </Button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              : "space-y-3"
          }>
            {filteredAndSortedDocs.map((doc) => (
              <AnimatedCard
                key={doc.id}
                className={`group hover:shadow-lg transition-all duration-200 ${
                  viewMode === 'grid' ? 'p-4' : 'p-4'
                }`}
              >
                {viewMode === 'grid' ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {doc.filename}
                      </h3>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(doc.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {formatFileSize(doc.file_size)}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {doc.page_count} pages
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(doc.id, doc.filename)}
                        disabled={deletingIds.has(doc.id)}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                      >
                        {deletingIds.has(doc.id) ? (
                          <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate mb-1">{doc.filename}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(doc.created_at)}</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{doc.page_count} pages</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(doc.id, doc.filename)}
                        disabled={deletingIds.has(doc.id)}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
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
        )}
      </AnimatedCard>
    </div>
  );
}