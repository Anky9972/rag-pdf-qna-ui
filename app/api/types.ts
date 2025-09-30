
// Auth-related types
export interface UserSignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    email: string;
    profile: Record<string, any>;
    created_at: string;
  };
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  profile: Record<string, any>;
  created_at: string;
}

export interface LogoutResponse {
  message: string;
}

// Existing types (from previous response)
export interface HealthResponse {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: number;
  checks: {
    database: string;
    weaviate: string;
    llm_providers: string;
    system_resources: {
      cpu_usage_percent: number;
      memory_usage_percent: number;
      disk_usage_percent: number;
      status: string;
    };
  };
}

export interface StatsResponse {
  totals: {
    users: number;
    documents: number;
    queries: number;
    conversations: number;
  };
  recent_24h: {
    users: number;
    queries: number;
    documents: number;
  };
  performance: {
    avg_query_latency_ms: number;
    total_cost_cents: number;
  };
  provider_usage: Record<string, number>;
  system_info: {
    uptime_seconds: number;
    cpu_count: number;
    memory_total_gb: number;
  };
}

export interface UploadResponse {
  message: string;
  pdf_id: string;
  filename: string;
  processing_time: number;
  chunk_count: number;
  metadata: Record<string, any>;
}

export interface QueryRequest {
  query: string;
  pdf_id: string;
  conversation_id?: string;
  top_k?: number;
  use_reranking?: boolean;
  prefer_fast_response?: boolean;
  preferred_provider?: string;
  preferred_model?: string;
}

export interface QueryResponse {
  answer: string;
  sources: Array<{
    text: string;
    page_number: number;
    relevance_score: number;
    search_type: string;
  }>;
  conversation_id: string;
  provider_used: string;
  model_used: string;
  processing_time: number;
  tokens_used: number;
  cost_cents: number;
  search_metadata: {
    total_chunks_found: number;
    search_type: string;
    reranked: boolean;
  };
}

export interface ConversationSummary {
  id: string;
  title: string;
  document_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface MessageResponse {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface CreateConversationRequest {
  document_id: string;
  title?: string;
}

export interface ConversationResponse {
  id: string;
  title: string;
  document_id: string;
  created_at: string;
}

export interface DocumentSummary {
  id: string;
  filename: string;
  file_size: number;
  page_count: number;
  created_at: string;
  metadata: Record<string, any>;
}

export interface AnalyticsDashboard {
  queries_per_day: Array<{ date: string; count: number }>;
  provider_usage: Record<string, { count: number }>;
}

export interface ProvidersStatus {
  providers: Record<string, { available: boolean; [key: string]: any }>;
  active_count: number;
  default_provider: string;
}

export interface UpdateUserProfileRequest {
  profile_updates: Record<string, any>;
}

export interface UserProfileResponse {
  user_id: string;
  profile: Record<string, any>;
  updated: boolean;
}

export interface DeleteDocumentResponse {
  message: string;
}

export interface ErrorResponse {
  detail: string;
}
