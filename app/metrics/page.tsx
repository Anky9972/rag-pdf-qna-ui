// app/metrics/page.tsx
"use client"

import { useState } from "react"
import useSWR from "swr"
import { AnimatedCard } from "@/components/animated-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, Download, BarChart3, Filter } from "lucide-react"

const fetchText = (url: string) => fetch(url).then((r) => r.text())

export default function MetricsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyMatching, setShowOnlyMatching] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    `/api/metrics?refresh=${refreshKey}`,
    fetchText,
    { refreshInterval: 30000 }
  )

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    mutate()
  }

  const handleDownload = () => {
    if (!data) return
    
    const blob = new Blob([data], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `metrics-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Parse metrics data for stats
  const parseMetricsStats = (metricsText: string) => {
    if (!metricsText) return { totalMetrics: 0, helpLines: 0, typeLines: 0, dataLines: 0 }
    
    const lines = metricsText.split('\n').filter(line => line.trim())
    const helpLines = lines.filter(line => line.startsWith('# HELP')).length
    const typeLines = lines.filter(line => line.startsWith('# TYPE')).length
    const dataLines = lines.filter(line => !line.startsWith('#') && line.trim()).length
    
    return {
      totalMetrics: helpLines, // Each metric has a HELP line
      helpLines,
      typeLines,
      dataLines
    }
  }

  const filterMetrics = (metricsText: string) => {
    if (!searchTerm || !metricsText) return metricsText
    
    const lines = metricsText.split('\n')
    
    if (showOnlyMatching) {
      // Show only matching metrics with their HELP and TYPE lines
      const matchingMetrics = new Set<string>()
      
      // First pass: find matching metric names
      lines.forEach(line => {
        if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
          if (line.startsWith('# HELP')) {
            const metricName = line.split(' ')[2]
            matchingMetrics.add(metricName)
          } else if (line.startsWith('# TYPE')) {
            const metricName = line.split(' ')[2]
            matchingMetrics.add(metricName)
          } else if (!line.startsWith('#') && line.includes('{')) {
            const metricName = line.split('{')[0]
            matchingMetrics.add(metricName)
          } else if (!line.startsWith('#') && line.includes(' ')) {
            const metricName = line.split(' ')[0]
            matchingMetrics.add(metricName)
          }
        }
      })
      
      // Second pass: include all lines for matching metrics
      return lines.filter(line => {
        if (line.startsWith('# HELP')) {
          const metricName = line.split(' ')[2]
          return matchingMetrics.has(metricName)
        } else if (line.startsWith('# TYPE')) {
          const metricName = line.split(' ')[2]
          return matchingMetrics.has(metricName)
        } else if (!line.startsWith('#') && line.trim()) {
          const metricName = line.includes('{') ? line.split('{')[0] : line.split(' ')[0]
          return matchingMetrics.has(metricName)
        }
        return false
      }).join('\n')
    } else {
      // Highlight matching lines
      return lines
        .map(line => 
          line.toLowerCase().includes(searchTerm.toLowerCase())
            ? `🔍 ${line}`
            : line
        )
        .join('\n')
    }
  }

  const stats = data ? parseMetricsStats(data) : null
  const filteredData = data ? filterMetrics(data) : ""

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Metrics
        </h1>
        <p className="text-muted-foreground">Raw Prometheus metrics collected by the backend.</p>
      </header>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {searchTerm && (
            <Button
              variant={showOnlyMatching ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyMatching(!showOnlyMatching)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showOnlyMatching ? "Show All" : "Filter Only"}
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!data}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          
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
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatedCard className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalMetrics}</div>
            <div className="text-sm text-muted-foreground">Total Metrics</div>
          </AnimatedCard>
          
          <AnimatedCard className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.dataLines}</div>
            <div className="text-sm text-muted-foreground">Data Points</div>
          </AnimatedCard>
          
          <AnimatedCard className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.helpLines}</div>
            <div className="text-sm text-muted-foreground">Help Lines</div>
          </AnimatedCard>
          
          <AnimatedCard className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.typeLines}</div>
            <div className="text-sm text-muted-foreground">Type Definitions</div>
          </AnimatedCard>
        </div>
      )}

      {/* Search Results Info */}
      {searchTerm && (
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {showOnlyMatching ? "Filtered Results" : "Highlighted Results"}
          </Badge>
          {filteredData && (
            <span className="text-sm text-muted-foreground">
              {showOnlyMatching 
                ? `Showing metrics matching "${searchTerm}"`
                : `Highlighting matches for "${searchTerm}"`
              }
            </span>
          )}
        </div>
      )}

      {/* Metrics Data */}
      <AnimatedCard className="p-4">
        <div className="mb-4 flex items-center justify-between ">
          <h3 className="font-semibold">Raw Metrics Data</h3>
          {data && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Last updated: {new Date().toLocaleTimeString()}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {filteredData.split('\n').filter(line => line.trim()).length} lines
              </Badge>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading metrics…
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-destructive">Failed to load metrics. Please try refreshing.</p>
          </div>
        ) : (
          <div className="relative">
            <pre className="text-xs overflow-x-auto leading-6 whitespace-pre-wrap  p-4 rounded-md border max-h-[600px] overflow-y-auto">
              {filteredData || "No metrics data available"}
            </pre>
            
            {searchTerm && !showOnlyMatching && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  🔍 = Search matches
                </Badge>
              </div>
            )}
          </div>
        )}
      </AnimatedCard>

      {/* Metrics Info */}
      <AnimatedCard className="p-4">
        <h3 className="font-semibold mb-2">About Prometheus Metrics</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong># HELP</strong> lines describe what each metric measures</p>
          <p><strong># TYPE</strong> lines define the metric type (counter, gauge, histogram, summary)</p>
          <p><strong>Data lines</strong> contain the actual metric values with labels and timestamps</p>
        </div>
      </AnimatedCard>
    </main>
  )
}