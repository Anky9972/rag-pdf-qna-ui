// components/analytics/analytics-dashboard.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "../auth-context";
import { AnimatedCard } from "../animated-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  Clock, 
  RefreshCw, 
  DollarSign,
  Activity,
  Users,
  Target,
  Zap,
  Calendar,
  Filter,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  BarChart3
} from "lucide-react";

// Type definitions
type UserAnalytics = {
  total_queries: number;
  total_documents: number;
  avg_response_time: number;
  total_cost: number;
  provider_usage: Record<string, number>;
  popular_queries: string[];
};

type AnalyticsDashboard = {
  user_analytics: UserAnalytics;
  time_period_days: number;
  last_updated: string;
};

type TrendDataPoint = {
  date: string;
  day: string;
  queries: number;
  documents: number;
  cost: number;
};

type TrendsResponse = {
  trends: TrendDataPoint[];
  period_days: number;
};

// Enhanced color palette
const CHART_COLORS = [
  'oklch(0.55 0.25 285)', // primary
  'oklch(0.72 0.15 15)',  // accent
  'oklch(0.65 0.18 165)', // accent-2
  'oklch(0.75 0.15 200)', // chart-4
  'oklch(0.70 0.12 45)',  // chart-5
  'oklch(0.68 0.16 320)', // purple variant
  'oklch(0.70 0.14 35)',  // orange variant
];

const TIME_RANGES = [
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

export function AnalyticsDashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const [timeRange, setTimeRange] = useState("7");
  const router = useRouter();

  // Unified fetcher with error handling
  const fetcher = async (url: string) => {
    if (!user) {
      throw new Error("Not authenticated - no active session");
    }
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: "include",
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.warn("🔒 401 Unauthorized - session expired");
        await logout();
        router.push("/login");
        throw new Error("Session expired. Please log in again.");
      }
      
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData?.detail || errorMessage;
      } catch {
        errorMessage = errorText || response.statusText;
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  };

  // Fetch analytics data
  const { 
    data: analytics, 
    isLoading: analyticsLoading, 
    error: analyticsError, 
    mutate: mutateAnalytics 
  } = useSWR<AnalyticsDashboard>(
    user ? `/api/analytics/dashboard?days=${timeRange}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      onError: (error) => {
        console.error("Analytics fetch error:", error);
      }
    }
  );

  // Fetch trends data
  const { 
    data: trendsResponse, 
    isLoading: trendsLoading, 
    error: trendsError,
    mutate: mutateTrends
  } = useSWR<TrendsResponse>(
    user ? `/api/analytics/trends?days=${timeRange}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      onError: (error) => {
        console.error("Trends fetch error:", error);
      }
    }
  );

  const isLoading = analyticsLoading || trendsLoading;
  const error = analyticsError || trendsError;
  const trendData = trendsResponse?.trends || [];

  // Transform provider usage data for pie chart
  const providerData = analytics?.user_analytics?.provider_usage 
    ? Object.entries(analytics.user_analytics.provider_usage).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: count,
      }))
    : [];

  // Calculate trend changes (comparing first half vs second half of period)
  const calculateTrend = (data: TrendDataPoint[], key: 'queries' | 'documents' | 'cost') => {
    if (data.length < 2) return { change: "0.0%", trend: "neutral" as const };
    
    const midpoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midpoint);
    const secondHalf = data.slice(midpoint);
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d[key], 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d[key], 0) / secondHalf.length;
    
    if (firstAvg === 0) return { change: "N/A", trend: "neutral" as const };
    
    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
    const trend = key === 'cost' 
      ? (percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral")
      : (percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral");
    
    return {
      change: `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`,
      trend
    };
  };

  const queryTrend = calculateTrend(trendData, 'queries');
  const documentTrend = calculateTrend(trendData, 'documents');
  const costTrend = calculateTrend(trendData, 'cost');

  const handleRefresh = () => {
    mutateAnalytics();
    mutateTrends();
  };

  const handleExport = () => {
    if (!analytics) return;
    
    const exportData = {
      exported_at: new Date().toISOString(),
      time_period_days: timeRange,
      analytics: analytics.user_analytics,
      trends: trendData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(value);
  };

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(2)}s`;
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-accent rounded-full animate-spin animation-delay-150"></div>
        </div>
        <div className="text-muted-foreground mt-6 text-lg">Loading your analytics...</div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent-2 rounded-2xl flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <div className="text-muted-foreground mb-6">Please log in to view your analytics dashboard.</div>
        <Button onClick={() => router.push("/login")} className="btn-gradient px-8 py-3">
          Log In
        </Button>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Failed to Load Analytics</h2>
        <div className="text-muted-foreground mb-6 max-w-md">
          {error.message || "An unexpected error occurred"}
        </div>
        <div className="flex gap-4">
          <Button onClick={handleRefresh} variant="outline" className="px-8 py-3">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => router.push("/dashboard")} variant="ghost" className="px-8 py-3">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Queries",
      value: analytics?.user_analytics?.total_queries ?? 0,
      icon: MessageSquare,
      color: "from-primary to-primary/80",
      change: queryTrend.change,
      trend: queryTrend.trend
    },
    {
      title: "Documents",
      value: analytics?.user_analytics?.total_documents ?? 0,
      icon: FileText,
      color: "from-accent-2 to-accent-2/80",
      change: documentTrend.change,
      trend: documentTrend.trend
    },
    {
      title: "Avg Response Time",
      value: analytics?.user_analytics?.avg_response_time 
        ? formatTime(analytics.user_analytics.avg_response_time)
        : "0.00s",
      icon: Zap,
      color: "from-accent to-accent/80",
      change: "N/A",
      trend: "neutral"
    },
    {
      title: "Total Cost",
      value: analytics?.user_analytics?.total_cost 
        ? formatCurrency(analytics.user_analytics.total_cost)
        : "$0.0000",
      icon: DollarSign,
      color: "from-chart-4 to-chart-5",
      change: costTrend.change,
      trend: costTrend.trend
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-2 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-accent-2 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Last updated: {analytics?.last_updated 
                      ? new Date(analytics.last_updated).toLocaleString()
                      : "Never"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 glass rounded-xl p-1">
              <Filter className="w-4 h-4 ml-3 text-muted-foreground" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer"
                disabled={isLoading}
              >
                {TIME_RANGES.map(range => (
                  <option key={range.value} value={range.value} className="bg-background text-foreground">
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="glass hover:text-primary hover:border-primary"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button 
              onClick={handleExport}
              variant="outline" 
              size="sm" 
              className="glass hover:text-primary hover:border-primary"
              disabled={!analytics}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <AnimatedCard key={stat.title} className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300" 
                   style={{ background: `linear-gradient(135deg, ${CHART_COLORS[index]}, transparent)` }} />
              
              <div className="relative p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.change !== "N/A" && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-accent-2' : 
                      stat.trend === 'down' ? 'text-accent' : 
                      'text-muted-foreground'
                    }`}>
                      {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
                      {stat.trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">
                    {isLoading ? (
                      <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart - Takes 2 columns */}
          <AnimatedCard className="lg:col-span-2 p-6 glass">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Usage Trends
              </h3>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
            
            {trendsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse space-y-4 w-full">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-48 bg-muted rounded"></div>
                </div>
              </div>
            ) : trendData.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No usage data available</p>
                <p className="text-sm mt-2">Start querying documents to see trends!</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="queriesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="documentsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.01 280)" />
                    <XAxis 
                      dataKey="day" 
                      stroke="oklch(0.45 0.02 280)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="oklch(0.45 0.02 280)"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(0.99 0.005 280)', 
                        border: '1px solid oklch(0.93 0.01 280)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="queries" 
                      stroke={CHART_COLORS[0]} 
                      fillOpacity={1}
                      fill="url(#queriesGradient)"
                      strokeWidth={3}
                      name="Queries"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="documents" 
                      stroke={CHART_COLORS[1]} 
                      fillOpacity={1}
                      fill="url(#documentsGradient)"
                      strokeWidth={3}
                      name="Documents"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </AnimatedCard>

          {/* Provider Usage Pie Chart */}
          <AnimatedCard className="p-6 glass">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Providers
              </h3>
            </div>
            
            {analyticsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-32 h-32 border-8 border-muted border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : providerData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={providerData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      strokeWidth={2}
                      stroke="oklch(0.99 0.005 280)"
                    >
                      {providerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(0.99 0.005 280)', 
                        border: '1px solid oklch(0.93 0.01 280)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <Target className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No provider data</p>
                <p className="text-sm mt-2">Make queries to see usage</p>
              </div>
            )}
          </AnimatedCard>
        </div>

        {/* Popular Queries */}
        <AnimatedCard className="p-6 glass">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent-2" />
              Popular Queries
            </h3>
          </div>
          
          {analyticsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : analytics?.user_analytics?.popular_queries?.length ? (
            <div className="space-y-3">
              {analytics.user_analytics.popular_queries.slice(0, 8).map((query, index) => (
                <div 
                  key={index}
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-transparent rounded-xl hover:from-primary/5 hover:to-accent/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${CHART_COLORS[index % CHART_COLORS.length]}, ${CHART_COLORS[(index + 1) % CHART_COLORS.length]})` }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {query}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full ml-4 flex-shrink-0">
                    Query #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">No recent queries</p>
              <p className="text-sm mt-2">Your query history will appear here</p>
            </div>
          )}
        </AnimatedCard>
      </div>
    </div>
  );
}