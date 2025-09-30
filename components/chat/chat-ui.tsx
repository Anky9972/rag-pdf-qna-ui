"use client";
import React, { Fragment } from "react";
import { useEffect, useMemo, useState, useRef } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedCard } from "../animated-card";
import { DocumentsList } from "../documents-list";
import { UploadPdf } from "../upload-pdf";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-context";
import { 
  Send, 
  Upload, 
  FileText, 
  MessageCircle, 
  Bot, 
  User,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronRight,
  Trash2,
  Plus,
  Copy,
  Check
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

// Message type definition
type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  metadata?: any;
  isOptimistic?: boolean;
  isStreaming?: boolean;
};

// Enhanced message formatting component
function FormattedMessage({ content, isStreaming = false }: { content: string; isStreaming?: boolean }) {
  console.log("Raw content:", content);
  const [displayedContent, setDisplayedContent] = useState(isStreaming ? "" : content);
  const [copied, setCopied] = useState(false);
  const [isValidMarkdown, setIsValidMarkdown] = useState<boolean>(false);

  // Preprocess markdown to handle newlines and table formatting
  const preprocessMarkdown = (text: string) => {
    let processed = text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\\\n/g, '\n') // Handle escaped newlines
      .trim(); // Remove leading/trailing whitespace

    // Preserve paragraph breaks and normalize table/list newlines
    processed = processed
      .replace(/(\n\s*){2,}/g, '\n\n') // Ensure exactly two newlines for paragraphs
      .replace(/\|[ \t]+/g, '| ') // Normalize spaces after pipes
      .replace(/[ \t]+\|/g, ' |') // Normalize spaces before pipes
      .replace(/^\s*\|/gm, '|') // Ensure pipes start at beginning of line
      .replace(/\|\s*$/gm, '|'); // Ensure pipes end lines properly

    const lines = processed.split('\n');
    const normalizedLines = lines.map((line, index) => {
      if (line.match(/^\|.*\|$/)) {
        return line.trimEnd();
      } else if (line.match(/^\s*$/) && index > 0 && index < lines.length - 1) {
        return '\n';
      }
      return line;
    });

    return normalizedLines.join('\n');
  };

  // Check if content forms a valid markdown structure
  const isValidMarkdownStructure = (text: string) => {
    if (!text.trim()) return false;
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length >= 3 && lines[0].startsWith('|') && lines[1].match(/^\|[-:\s|]+$/)) {
      return true;
    }
    
    return (
      lines.some(line => line.match(/^#{1,6}\s+/)) || // Headers
      lines.some(line => line.match(/^[-*]\s+/)) || // Unordered lists
      lines.some(line => line.match(/^\d+\.\s+/)) || // Ordered lists
      lines.some(line => line.match(/^>\s+/)) || // Blockquotes
      lines.some(line => line.match(/^```/)) || // Code blocks
      lines.some(line => line.trim().length > 0) // Non-empty paragraphs
    );
  };

  // Streaming effect
  useEffect(() => {
    if (isStreaming && content) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < content.length) {
          const newContent = content.slice(0, currentIndex + 1);
          const processedContent = preprocessMarkdown(newContent);
          setDisplayedContent(processedContent);
          setIsValidMarkdown(isValidMarkdownStructure(processedContent));
          currentIndex++;
        } else {
          const processedContent = preprocessMarkdown(content);
          setDisplayedContent(processedContent);
          setIsValidMarkdown(isValidMarkdownStructure(processedContent));
          clearInterval(interval);
        }
      }, 50); // Slower interval to reduce partial rendering issues
      return () => clearInterval(interval);
    } else {
      const processedContent = preprocessMarkdown(content);
      setDisplayedContent(processedContent);
      setIsValidMarkdown(isValidMarkdownStructure(processedContent));
    }
  }, [content, isStreaming]);

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative group">
      <div className="prose prose-sm max-w-none">
        {isStreaming && !isValidMarkdown ? (
          <span className="text-sm text-muted-foreground">Generating content...</span>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              // Table and table cells with coloring
              table: ({ node, ...props }) => (
                <table className="border border-white w-full bg-card/80" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="border border-white px-4 py-2 text-sm font-medium bg-primary/20 text-primary" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-white px-4 py-2 text-sm text-foreground" {...props} />
              ),
              // Headings with color emphasis
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl font-bold text-primary mt-6 mb-3" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-semibold text-accent mt-5 mb-2" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-medium text-accent-2 mt-4 mb-2" {...props} />
              ),
              // Paragraphs with subtle highlight for key terms
              p: ({ node, ...props }) => {
                const children = React.Children.toArray(props.children);
                const enhancedChildren = children.map((child, index) => {
                  if (typeof child === 'string') {
                    // Highlight key terms (e.g., "Confidential Information", "Accenture", "Recipient")
                    const highlighted = child.replace(
                      /\b(Confidential Information|Accenture|Recipient)\b/g,
                      '<span class="text-primary font-semibold">$1</span>'
                    );
                    return <span key={index} dangerouslySetInnerHTML={{ __html: highlighted }} />;
                  }
                  return child;
                });
                return <p className="text-sm leading-relaxed mb-4 text-foreground" {...props}>{enhancedChildren}</p>;
              },
              // Lists with colored bullets
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside space-y-2 my-4 pl-4 text-foreground" style={{ color: 'var(--color-primary)' }} {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside space-y-2 my-4 pl-4 text-foreground" style={{ color: 'var(--color-accent-2)' }} {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-sm leading-relaxed" {...props} />
              ),
              // Code blocks with background color
              code: ({ node, inline, ...props }) => (
                inline ? (
                  <code className="bg-muted/50 text-accent rounded px-1 py-0.5" {...props} />
                ) : (
                  <pre className="bg-muted/80 text-foreground rounded p-4 overflow-x-auto">
                    <code {...props} />
                  </pre>
                )
              ),
              // Blockquotes with color
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-accent/50 pl-4 italic text-muted-foreground my-4" {...props} />
              ),
              // Strong (bold) text with color
              strong: ({ node, ...props }) => (
                <strong className="text-accent-2 font-bold" {...props} />
              ),
            }}
          >
            {displayedContent}
          </ReactMarkdown>
        )}
      </div>
      {isStreaming && isValidMarkdown && (
        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1"></span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="absolute z-20 -top-2 -right-4 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </Button>
    </div>
  );
}
export function ChatUI({ initialPdfId }: { initialPdfId?: string }) {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isInitialized } = useAuth();
  const [pdfId, setPdfId] = useState<string | undefined>(initialPdfId);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'documents' | 'conversations'>('documents');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Create authenticated fetcher
  const authenticatedFetcher = async (url: string) => {
    if (!user) {
      throw new Error("Not authenticated - no active session");
    }
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: "include", // Send httpOnly cookie
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
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
    } catch (error) {
      throw error;
    }
  };

  const shouldFetch = isInitialized && !authLoading && !!user;

  // Fetch conversations
  const { data: conversations, mutate: refreshConvos } = useSWR(
    shouldFetch ? "/api/conversations/?limit=20&offset=0" : null,
    authenticatedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    }
  );

  // Fetch messages for selected conversation
  const { data: remoteMessages, mutate: refreshMessages } = useSWR<Message[]>(
    shouldFetch && conversationId ? `/api/conversations/${conversationId}/messages?limit=200` : null,
    authenticatedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    }
  );

  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const mergedMessages = useMemo(() => {
    if (!conversationId) return localMessages;
    return remoteMessages || [];
  }, [conversationId, remoteMessages, localMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [mergedMessages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  async function ensureConversation(userQuery: string) {
    if (conversationId || !pdfId || !user) {
      return conversationId;
    }
    
    try {
      // Truncate query to 100 characters for title
      const title = userQuery.length > 100 ? userQuery.substring(0, 97) + '...' : userQuery;
      
      const res = await fetch("/api/conversations/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          document_id: pdfId,
          title // Include title in the request
        }),
        credentials: "include", // Send httpOnly cookie
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        try {
          const err = JSON.parse(errorText);
          throw new Error(err?.detail || "Failed to create conversation");
        } catch (parseError) {
          throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
        }
      }
      
      const data = await res.json();
      setConversationId(data.id);
      await refreshConvos();
      return data.id as string;
    } catch (error) {
      throw error;
    }
  }

  async function send() {
    if (!user) {
      toast({ title: "Error", description: "Please log in to chat.", variant: "destructive" });
      return;
    }
    if (!input.trim()) {
      toast({ title: "Error", description: "Please enter a question.", variant: "destructive" });
      return;
    }
    if (!pdfId) {
      toast({ title: "Error", description: "Please select or upload a PDF.", variant: "destructive" });
      return;
    }
    
    setSending(true);
    const userMessage = input.trim();
    const tempMessageId = `temp-${Date.now()}`;
    let assistantMessageId: string | undefined = undefined;
    
    try {
      const convId = await ensureConversation(userMessage);
      
      // Add optimistic user message
      if (!conversationId) {
        setLocalMessages((m) => [...m, { 
          id: tempMessageId,
          role: "user", 
          content: userMessage, 
          isOptimistic: true 
        }]);
        
        // Add streaming assistant message placeholder
        assistantMessageId = `assistant-${Date.now()}`;
        setLocalMessages((m) => [...m, { 
          id: assistantMessageId,
          role: "assistant", 
          content: "", 
          isStreaming: true 
        }]);
        setStreamingMessageId(assistantMessageId);
      }
      
      const queryPayload = {
        query: userMessage,
        pdf_id: pdfId,
        conversation_id: convId,
        top_k: 5,
        use_reranking: true,
        prefer_fast_response: false,
      };
      
      const res = await fetch("/api/query/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryPayload),
        credentials: "include", // Send httpOnly cookie
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        try {
          const err = JSON.parse(errorText);
          throw new Error(err?.detail || "Query failed");
        } catch (parseError) {
          throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
        }
      }
      
      const data = await res.json();
      
      setInput("");
      setConversationId(data.conversation_id || convId);
      
      // Switch to conversations tab to show the new conversation
      setActiveTab('conversations');
      
      // Force refresh messages after setting conversationId
      if (data.conversation_id || convId) {
        await refreshMessages();
      }
      
      // Update localMessages if no conversationId existed initially
      if (!conversationId && assistantMessageId) {
        setLocalMessages((m) => m.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: data.answer, isStreaming: true }
            : msg
        ));
        
        // Stop streaming after a delay
        setTimeout(() => {
          setLocalMessages((m) => m.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, isStreaming: false }
              : msg
          ));
          setStreamingMessageId(null);
        }, 100);
      }
      
      // Ensure conversations are refreshed to show the new conversation with title
      await refreshConvos();
      
      toast({ title: "Success", description: "Message sent successfully!" });
    } catch (e: any) {
      console.error("Send error:", e);
      toast({ title: "Error", description: e.message || "Error sending message", variant: "destructive" });
      
      // Remove optimistic messages on error
      if (!conversationId && assistantMessageId) {
        setLocalMessages((m) => m.filter(msg => !msg.isOptimistic && msg.id !== assistantMessageId));
      }
      setStreamingMessageId(null);
    } finally {
      setSending(false);
    }
  }

  function handleSelectDocument(doc: any) {
    setPdfId(doc.id);
    setConversationId(undefined);
    setLocalMessages([]);
    toast({ title: "Document selected", description: `Ready to chat with ${doc.filename}` });
  }

  function handleUploadedDocument(doc: any) {
    setPdfId(doc.pdf_id);
    setConversationId(undefined);
    setLocalMessages([]);
    setActiveTab('documents');
    toast({ title: "Upload successful", description: "Document ready for chat!" });
  }

  function handleSelectConversation(conv: any) {
    setConversationId(conv.id);
    setPdfId(conv.document_id);
    setLocalMessages([]);
    refreshMessages(); // Ensure messages are fetched for the selected conversation
  }

  async function deleteConversation(convId: string) {
    if (!user) return;
    
    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: "DELETE",
        credentials: "include", // Send httpOnly cookie
      });
      
      if (!res.ok) throw new Error("Failed to delete conversation");
      
      if (conversationId === convId) {
        setConversationId(undefined);
        setLocalMessages([]);
      }
      
      await refreshConvos();
      toast({ title: "Success", description: "Conversation deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete conversation", variant: "destructive" });
    }
  }

  function startNewConversation() {
    setConversationId(undefined);
    setLocalMessages([]);
    toast({ title: "New conversation", description: "Ready to start a new chat!" });
  }

  useEffect(() => {
    if (initialPdfId) {
      setPdfId(initialPdfId);
    }
  }, [initialPdfId]);

  if (!isInitialized || authLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">
            {!isInitialized ? "Initializing authentication..." : "Loading authentication..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Welcome to AI Chat</h2>
          <p className="text-muted-foreground">Please log in to start chatting with your documents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sidebar */}
      <div className={`transition-all duration-300 border-r border-border/50 bg-card/80 backdrop-blur-md ${
        sidebarCollapsed ? 'w-16' : 'w-96'
      }`}>
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Assistant
              </h2>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hover:text-primary transition-all duration-200"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {!sidebarCollapsed && (
          <div className="flex-1 overflow-hidden">
            {/* Tab Navigation */}
            <div className="p-4 border-b border-border/50">
              <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                <Button
                  variant={activeTab === 'upload' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('upload')}
                  className="flex-1 text-xs"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
                <Button
                  variant={activeTab === 'documents' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('documents')}
                  className="flex-1 text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Files
                </Button>
                <Button
                  variant={activeTab === 'conversations' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('conversations')}
                  className="flex-1 text-xs"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Chats
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 overflow-y-auto h-[calc(100%-120px)]">
              {activeTab === 'upload' && (
                <AnimatedCard className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">Upload PDF</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a PDF document to start chatting
                      </p>
                    </div>
                    <UploadPdf onUploaded={handleUploadedDocument} />
                  </div>
                </AnimatedCard>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-3">
                  {/* <div className="flex items-center justify-between">
                    <h3 className="font-medium">Your Documents</h3>
                  </div> */}
                  <DocumentsList onSelect={handleSelectDocument} />
                </div>
              )}

              {activeTab === 'conversations' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Conversations</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={startNewConversation}
                      className="hover:text-primary transition-all duration-200"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      New
                    </Button>
                  </div>
                  <div className=" flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-300px)] px-2"
                  style={{scrollbarColor: 'rgba(100, 100, 100, 0.5) transparent', scrollbarWidth: 'thin', scrollbarGutter: 'stable' }}
                  >
                    {!conversations ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : (conversations?.results || conversations || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
                    ) : (
                      (conversations?.results || conversations || []).map((c: any) => (
                        <div
                          key={c.id}
                          className="group"
                          onClick={() => handleSelectConversation(c)}
                          style={{ cursor: "pointer" }}
                        >
                          <AnimatedCard
                            className={`p-3 transition-all hover:bg-purple-500/25 hover:border-purple-500 hover:shadow-sm  ${
                              c.id === conversationId
                                ? "bg-purple-500/40 border-purple-500 shadow-sm"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {c.title || "Untitled Chat"}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(c.updated_at || c.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversation(c.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </AnimatedCard>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-2 border-b border-border/50 bg-card/30 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Chat Assistant
              </h1>
              {pdfId && (
                <p className="text-sm text-muted-foreground">
                  Ready to answer questions about your document
                </p>
              )}
            </div>
            {pdfId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Document loaded
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6"
        style={{scrollbarColor: 'rgba(100, 100, 100, 0.5) transparent', scrollbarWidth: 'thin', scrollbarGutter: 'stable' }}
        >
          {mergedMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ready to help!</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {pdfId 
                      ? "Ask me anything about your document. I'm here to help you understand and analyze the content."
                      : "Select a PDF document from the sidebar to get started with your AI-powered chat assistant."
                    }
                  </p>
                </div>
                {!pdfId && (
                  <Button
                    onClick={() => setActiveTab('documents')}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Choose Document
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {mergedMessages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-purple-500 text-primary-foreground ml-auto'
                        : 'bg-card/80 backdrop-blur-sm border border-border/50'
                    } ${message.isOptimistic ? 'opacity-70' : ''}`}
                  >
                    {message.role === 'assistant' ? (
                      <FormattedMessage 
                        content={message.content} 
                        isStreaming={message.isStreaming || false}
                      />
                    ) : (
                      <div className="text-sm leading-relaxed ">
                        {message.content}
                      </div>
                    )}
                    {message.created_at && (
                      <div className="text-xs text-white font-extrabold opacity-70 mt-3">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="px-4 pt-4 border-t border-border/50 bg-card/30 backdrop-blur-md ">
          <div className="flex items-end gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder={pdfId ? "Ask anything about your document..." : "Please select a document first..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!pdfId || sending}
                className="min-h-[60px] max-h-[120px] resize-none pr-12 rounded-2xl border-2 focus:border-primary/50 transition-all duration-200 bg-background/50 backdrop-blur-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                Press ⏎ to send
              </div>
            </div>
            <Button
              onClick={send}
              disabled={sending || !input.trim() || !pdfId}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 rounded-2xl min-w-[100px] shadow-lg hover:shadow-xl"
            >
              {sending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Sending
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </div>
              )}
            </Button>
          </div>
          
          {!pdfId && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Select a document from the sidebar to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}