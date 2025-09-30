// components/UploadPdf.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileCheck,
  Cloud,
  Zap,
  ArrowUpCircle,
  HardDrive,
  Clock
} from "lucide-react";

interface UploadedDocument {
  id: string;
  filename: string;
  processing_time?: number;
  file_size?: number;
  page_count?: number;
}

interface UploadPdfProps {
  onUploaded?: (doc: UploadedDocument) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'dropzone';
}

export function UploadPdf({ onUploaded, className = '', variant = 'default' }: UploadPdfProps) {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  const validateFile = useCallback((selectedFile: File): boolean => {
    if (selectedFile.type !== "application/pdf" ) {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are supported. Please select a PDF file.",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a PDF file smaller than 50MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setUploadProgress(0);
    }
  }, [validateFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const clearFile = useCallback(() => {
    setFile(null);
    setUploadProgress(0);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload documents.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please choose a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      const form = new FormData();
      form.append("file", file);
      
      const res = await fetch("/api/upload_pdf/", {
        method: "POST",
        credentials: "include",
        body: form,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) {
          await logout();
          router.push("/login");
          throw new Error("Session expired. Redirecting to login.");
        }
        throw new Error(err?.detail || "Upload failed");
      }

      const data = await res.json();
      
      toast({
        title: "Upload successful!",
        description: (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{data?.filename ?? file.name}</span>
            <span className="text-xs text-muted-foreground">
              Processed in {data?.processing_time?.toFixed?.(2) ?? "?"}s
            </span>
          </div>
        ),
      });

      onUploaded?.(data);
      setFile(null);
      setUploadProgress(0);
      
      if (inputRef.current) {
        inputRef.current.value = '';
      }

    } catch (e: any) {
      console.error("Upload error:", e);
      clearInterval(progressInterval);
      setUploadProgress(0);
      
      toast({
        title: "Upload failed",
        description: e.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, file, toast, router, logout, onUploaded]);

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleInputChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          {file ? file.name.slice(0, 20) + (file.name.length > 20 ? '...' : '') : 'Choose PDF'}
        </Button>
        <Button
          onClick={handleUpload}
          disabled={loading || !file}
          size="sm"
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-sm hover:shadow-md transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </div>
    );
  }

  // Dropzone variant
  if (variant === 'dropzone') {
    return (
      <div className={`w-full ${className}`}>
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : file
              ? 'border-green-500 bg-green-50 dark:bg-green-950'
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />

          {loading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Processing your PDF...</h3>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}% complete</p>
              </div>
            </div>
          ) : file ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center">
                <FileCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to upload</h3>
                <div className="bg-background rounded-lg p-4 border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {formatFileSize(file.size)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(file.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFile}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={handleUpload}
                    disabled={!file}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Process PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearFile}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                <Cloud className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Drop your PDF here</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  or <button 
                    onClick={() => inputRef.current?.click()}
                    className="text-primary hover:underline font-medium"
                  >
                    browse to choose a file
                  </button>
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    PDF files only
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    Max 50MB
                  </span>
                </div>
              </div>
            </div>
          )}

          {dragActive && (
            <div className="absolute inset-0 bg-primary/5 rounded-xl flex items-center justify-center">
              <div className="text-primary font-semibold">Drop your PDF file here!</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="gap-2 flex-1 hover:bg-primary/5 hover:border-primary/20 transition-all"
        >
          <Upload className="w-4 h-4" />
          {file ? (
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-primary" />
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({formatFileSize(file.size)})
              </span>
            </div>
          ) : (
            'Choose PDF file'
          )}
        </Button>

        {file && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFile}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processing...</span>
            <span className="font-medium">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={loading || !file}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-sm hover:shadow-md transition-all gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing PDF...
          </>
        ) : (
          <>
            <ArrowUpCircle className="w-4 h-4" />
            Upload & Process PDF
          </>
        )}
      </Button>

      {!loading && (
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            PDF files only
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            Max 50MB
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Secure upload
          </span>
        </div>
      )}
    </div>
  );
}