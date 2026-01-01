"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Rocket, TrendingUp } from "lucide-react"

export default function SelectBusinessTypePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<"ideation" | "active" | null>(null)

  const handleContinue = () => {
    if (selected === "ideation") {
      router.push("/entrepreneur/businesses/new?type=ideation")
    } else if (selected === "active") {
      router.push("/entrepreneur/businesses/new?type=active")
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Submit Your Business</h1>
          <p className="text-muted-foreground">First, tell us about your business stage</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card
            className={`cursor-pointer transition-all ${
              selected === "ideation" ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
            }`}
            onClick={() => setSelected("ideation")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <Rocket className="h-6 w-6 text-secondary" />
                </div>
              </div>
              <CardTitle>Ideation Stage</CardTitle>
              <CardDescription>I have a business idea but haven't launched yet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Early-stage concept or pre-launch</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>No revenue yet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Seeking seed funding or early investment</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              selected === "active" ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
            }`}
            onClick={() => setSelected("active")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>Active Business</CardTitle>
              <CardDescription>I already have an operating/revenue business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Business is already operating</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Generating revenue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Seeking growth or expansion funding</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Link href="/entrepreneur/businesses" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleContinue} disabled={!selected} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
