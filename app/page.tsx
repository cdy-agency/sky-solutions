import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, ArrowRight, Shield, Zap, Globe, Building2 } from "lucide-react"
import { redirect } from "next/navigation"

export default function HomePage() {

  redirect("/login")
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/blue-20and-20orange-20circle-20icon-20business-20logo-20-283-29.png"
              alt="SKY Solutions Logo"
              width={180}
              height={60}
              className="h-12 w-auto"
            />
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - Removed gradients, using solid colors */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Connect Your Vision with the Right Investment
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            SKY Solutions bridges the gap between ambitious entrepreneurs and visionary investors. Turn your business
            dreams into reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=entrepreneur">
              <Button size="lg" className="w-full sm:w-auto">
                I'm an Entrepreneur
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register?role=investor">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
              >
                I'm an Investor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Solid background instead of gradient */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose SKY Solutions?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="h-10 w-10" />}
              title="Secure Platform"
              description="Your business plans and investments are protected with enterprise-grade security."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10" />}
              title="Fast Connections"
              description="Get matched with the right investors or businesses quickly and efficiently."
            />
            <FeatureCard
              icon={<Globe className="h-10 w-10" />}
              title="Global Network"
              description="Access a worldwide network of entrepreneurs and investors."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard icon={<Users className="h-8 w-8" />} value="500+" label="Active Users" />
            <StatCard icon={<Building2 className="h-8 w-8" />} value="200+" label="Businesses Funded" />
            <StatCard icon={<TrendingUp className="h-8 w-8" />} value="$10M+" label="Total Investments" />
          </div>
        </div>
      </section>

      {/* CTA Section - Solid primary color, no gradient */}
      <section className="py-20 px-4 bg-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary-foreground">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Join thousands of entrepreneurs and investors who are already growing their success with SKY Solutions.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Create Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-background">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/blue-20and-20orange-20circle-20icon-20business-20logo-20-283-29.png"
              alt="SKY Solutions Logo"
              width={140}
              height={45}
              className="h-10 w-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SKY Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="p-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/20 text-primary mb-4">
        {icon}
      </div>
      <p className="text-4xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  )
}
