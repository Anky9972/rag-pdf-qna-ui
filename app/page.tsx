import Link from "next/link"
import { AwesomeCard } from "@/components/awesome-card"
import { HeroInteractive } from "@/components/hero-interactive"
import { Upload, MessageSquareText, TrendingUp, ArrowRight, FileCheck, Brain, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Full Width */}
      <HeroInteractive />
      
      {/* Main Content Container */}
      <main className="relative">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-accent-2/5 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              Core Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-accent to-accent-2 bg-clip-text text-transparent">
                Everything you need
              </span>
              <br />
              <span className="text-foreground">in one platform</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From document processing to intelligent conversations and comprehensive analytics — 
              streamline your workflow with our integrated AI platform.
            </p>
          </div>

          {/* Enhanced Feature Cards Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            <EnhancedFeatureCard
              icon={<Upload className="w-8 h-8" />}
              title="Upload & Process PDFs"
              subtitle="Lightning-fast document processing with intelligent embedding and indexing for instant searchability."
              gradient="from-primary to-accent"
              features={["Instant OCR processing", "Smart content extraction", "Automatic categorization"]}
            >
              <Link 
                href="/documents" 
                className="group inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-medium transition-all duration-300 hover:scale-105"
              >
                Manage Documents
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </EnhancedFeatureCard>

            <EnhancedFeatureCard
              icon={<MessageSquareText className="w-8 h-8" />}
              title="Intelligent Conversations"
              subtitle="Chat naturally with your documents using advanced AI that provides accurate, contextual answers with source citations."
              gradient="from-accent to-accent-2"
              features={["Contextual responses", "Source citations", "Multi-document queries"]}
            >
              <Link 
                href="/chat" 
                className="group inline-flex items-center gap-2 mt-6 px-6 py-3 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl font-medium transition-all duration-300 hover:scale-105"
              >
                Start Chatting
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </EnhancedFeatureCard>

            <EnhancedFeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Analytics & Monitoring"
              subtitle="Comprehensive insights into usage patterns, system performance, and provider health with real-time monitoring."
              gradient="from-accent-2 to-primary"
              features={["Real-time metrics", "Performance tracking", "Health monitoring"]}
            >
              <div className="flex gap-3 mt-6">
                <Link 
                  href="/dashboard" 
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-accent-2/10 hover:bg-accent-2/20 text-accent-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  Analytics
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  href="/monitoring" 
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  Monitoring
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </EnhancedFeatureCard>
          </section>

          {/* Additional Value Props Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ValuePropCard
              icon={<FileCheck className="w-6 h-6" />}
              title="Instant Processing"
              description="Documents processed in under 3 seconds"
              accent="accent"
            />
            <ValuePropCard
              icon={<Brain className="w-6 h-6" />}
              title="AI-Powered"
              description="Advanced language models for accuracy"
              accent="primary"
            />
            <ValuePropCard
              icon={<Shield className="w-6 h-6" />}
              title="Enterprise Security"
              description="Bank-grade encryption and compliance"
              accent="accent-2"
            />
            <ValuePropCard
              icon={<Zap className="w-6 h-6" />}
              title="99.9% Uptime"
              description="Reliable infrastructure you can trust"
              accent="accent"
            />
          </section>
        </div>
      </main>
    </div>
  )
}

function EnhancedFeatureCard({ 
  icon, 
  title, 
  subtitle, 
  gradient, 
  features, 
  children 
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  gradient: string
  features: string[]
  children: React.ReactNode
}) {
  return (
    <div className="group relative">
      {/* Gradient border wrapper */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Main card */}
      <div className="relative bg-card rounded-3xl p-8 border border-border/50 hover:border-transparent transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 h-full">
        {/* Icon with gradient background */}
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
          <div className="text-white">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {subtitle}
        </p>

        {/* Feature list */}
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA */}
        {children}

        {/* Hover glow effect */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(400px circle at 50% 50%, color-mix(in oklch, white 10%, transparent), transparent 50%)`
          }}
        />
      </div>
    </div>
  )
}

function ValuePropCard({ 
  icon, 
  title, 
  description, 
  accent 
}: {
  icon: React.ReactNode
  title: string
  description: string
  accent: string
}) {
  const accentColor = {
    'primary': 'text-primary bg-primary/10',
    'accent': 'text-accent bg-accent/10',
    'accent-2': 'text-accent-2 bg-accent-2/10'
  }[accent] || 'text-primary bg-primary/10'

  return (
    <div className="group relative p-6 rounded-2xl bg-card/50 border border-border/30 hover:border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${accentColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h4 className="font-semibold mb-2 text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}