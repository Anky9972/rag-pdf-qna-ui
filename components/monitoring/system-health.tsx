// components/monitoring/system-health.tsx
"use client"

import { useState } from "react"
import useSWR from "swr"
import { AnimatedCard } from "@/components/animated-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Activity, Server, Database, Cpu, HardDrive, MemoryStick, Clock } from "lucide-react"

interface SystemResources {
  cpu_usage_percent: number
  memory_usage_percent: number
  disk_usage_percent: number
  status: string
}

interface HealthChecks {
  database: string
  weaviate: string
  llm_providers: string
  system_resources: SystemResources
}

interface HealthResponse {
  status: string
  timestamp: number
  checks: HealthChecks
}

interface ProviderDetails {
  enabled: boolean
  models: string[]
  available: boolean
}

interface ProvidersStatus {
  providers: Record<string, ProviderDetails>
  active_count: number
  default_provider: string
}

interface StatsResponse {
  totals: {
    users: number
    documents: number
    queries: number
    conversations: number
  }
  recent_24h: {
    users: number
    queries: number
    documents: number
  }
  performance: {
    avg_query_latency_ms: number
    total_cost_cents: number
  }
  provider_usage: Record<string, number>
  system_info: {
    uptime_seconds: number
    cpu_count: number
    memory_total_gb: number
  }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const getStatusColor = (status: string) => {
  if (status.includes("healthy")) return "bg-green-100 text-green-800 border-green-200"
  if (status.includes("warning")) return "bg-yellow-100 text-yellow-800 border-yellow-200"
  return "bg-red-100 text-red-800 border-red-200"
}

const getResourceColor = (percentage: number) => {
  if (percentage < 50) return "bg-green-500"
  if (percentage < 80) return "bg-yellow-500"
  return "bg-red-500"
}

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function SystemMonitoring() {
  const [refreshKey, setRefreshKey] = useState(0)
  
  const { data: healthData, error: healthError, isLoading: healthLoading, mutate: mutateHealth } = useSWR<HealthResponse>(
    `/api/health?refresh=${refreshKey}`,
    fetcher,
    { refreshInterval: 30000 }
  )
  
  const { data: providersData, error: providersError, isLoading: providersLoading, mutate: mutateProviders } = useSWR<ProvidersStatus>(
    `/api/providers/status?refresh=${refreshKey}`,
    fetcher,
    { refreshInterval: 30000 }
  )
  
  const { data: statsData, error: statsError, isLoading: statsLoading, mutate: mutateStats } = useSWR<StatsResponse>(
    `/api/stats?refresh=${refreshKey}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    mutateHealth()
    mutateProviders()
    mutateStats()
  }

  const isLoading = healthLoading || providersLoading || statsLoading
  const hasError = healthError || providersError || statsError

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <span className="font-medium">System Health Overview</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <AnimatedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </h3>
          {healthData && (
            <Badge className={getStatusColor(healthData.status)}>
              {healthData.status.toUpperCase()}
            </Badge>
          )}
        </div>
        
        {healthLoading ? (
          <p className="text-muted-foreground">Loading health status...</p>
        ) : healthError ? (
          <p className="text-destructive">Failed to load health status</p>
        ) : healthData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4" />
                  Database
                </span>
                <Badge className={getStatusColor(healthData.checks.database)}>
                  {healthData.checks.database}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm">
                  <Server className="h-4 w-4" />
                  Weaviate
                </span>
                <Badge className={getStatusColor(healthData.checks.weaviate)}>
                  {healthData.checks.weaviate}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">LLM Providers</span>
                <Badge className={getStatusColor(healthData.checks.llm_providers)}>
                  {healthData.checks.llm_providers}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Check</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(healthData.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </AnimatedCard>

      {/* System Resources */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Resources
        </h3>
        
        {healthLoading ? (
          <p className="text-muted-foreground">Loading resource usage...</p>
        ) : healthError || !healthData ? (
          <p className="text-destructive">Failed to load resource usage</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Cpu className="h-4 w-4" />
                  CPU Usage
                </span>
                <span className="text-sm font-medium">
                  {healthData.checks.system_resources.cpu_usage_percent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getResourceColor(healthData.checks.system_resources.cpu_usage_percent)}`}
                  style={{ width: `${Math.min(healthData.checks.system_resources.cpu_usage_percent, 100)}%` }}
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <MemoryStick className="h-4 w-4" />
                  Memory Usage
                </span>
                <span className="text-sm font-medium">
                  {healthData.checks.system_resources.memory_usage_percent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getResourceColor(healthData.checks.system_resources.memory_usage_percent)}`}
                  style={{ width: `${Math.min(healthData.checks.system_resources.memory_usage_percent, 100)}%` }}
                />
              </div>
            </div>

            {/* Disk Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <HardDrive className="h-4 w-4" />
                  Disk Usage
                </span>
                <span className="text-sm font-medium">
                  {healthData.checks.system_resources.disk_usage_percent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getResourceColor(healthData.checks.system_resources.disk_usage_percent)}`}
                  style={{ width: `${Math.min(healthData.checks.system_resources.disk_usage_percent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </AnimatedCard>

      {/* Provider Status */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">LLM Providers</h3>
        
        {providersLoading ? (
          <p className="text-muted-foreground">Loading providers...</p>
        ) : providersError ? (
          <p className="text-destructive">Failed to load providers</p>
        ) : providersData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{providersData.active_count} active providers</span>
              <span>Default: {providersData.default_provider}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(providersData.providers).map(([name, details]) => (
                <div key={name} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium capitalize">{name}</h4>
                    <Badge variant={details.available ? "default" : "secondary"}>
                      {details.available ? "Available" : "Offline"}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {details.models.length} model{details.models.length !== 1 ? 's' : ''}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {details.models.slice(0, 2).map((model) => (
                      <Badge key={model} variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                    {details.models.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{details.models.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnimatedCard>

      {/* System Stats */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Statistics</h3>
        
        {statsLoading ? (
          <p className="text-muted-foreground">Loading statistics...</p>
        ) : statsError ? (
          <p className="text-destructive">Failed to load statistics</p>
        ) : statsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Totals */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Total Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Users</span>
                  <span className="font-medium">{statsData.totals.users.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Documents</span>
                  <span className="font-medium">{statsData.totals.documents.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Queries</span>
                  <span className="font-medium">{statsData.totals.queries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversations</span>
                  <span className="font-medium">{statsData.totals.conversations.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Last 24h</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">New Users</span>
                  <span className="font-medium">{statsData.recent_24h.users.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Queries</span>
                  <span className="font-medium">{statsData.recent_24h.queries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Documents</span>
                  <span className="font-medium">{statsData.recent_24h.documents.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Performance & System */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Avg Latency</span>
                  <span className="font-medium">{statsData.performance.avg_query_latency_ms.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Cost</span>
                  <span className="font-medium">${(statsData.performance.total_cost_cents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Uptime
                  </span>
                  <span className="font-medium">{formatUptime(statsData.system_info.uptime_seconds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Memory</span>
                  <span className="font-medium">{statsData.system_info.memory_total_gb.toFixed(1)} GB</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatedCard>

      {/* Provider Usage */}
      {statsData && Object.keys(statsData.provider_usage).length > 0 && (
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Provider Usage</h3>
          <div className="space-y-3">
            {Object.entries(statsData.provider_usage)
              .sort(([,a], [,b]) => b - a)
              .map(([provider, count]) => {
                const total = Object.values(statsData.provider_usage).reduce((a, b) => a + b, 0)
                const percentage = (count / total) * 100
                
                return (
                  <div key={provider} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{provider}</span>
                      <span>{count} queries ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </AnimatedCard>
      )}
    </div>
  )
}