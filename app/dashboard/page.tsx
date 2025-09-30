// app/dashboard/page.tsx
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <AnalyticsDashboard />
    </main>
  )
}
