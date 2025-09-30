// app/monitoring/page.tsx
import { SystemMonitoring } from "@/components/monitoring/system-health"

export default function MonitoringPage() {
  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Monitoring</h1>
        <p className="text-muted-foreground">Health checks and provider availability.</p>
      </header>
      <SystemMonitoring />
    </main>
  )
}
