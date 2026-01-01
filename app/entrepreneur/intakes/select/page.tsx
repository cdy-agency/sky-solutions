"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, TrendingUp, ArrowRight } from "lucide-react"

export default function IntakeSelectPage() {
  const router = useRouter()

  const forms = [
    {
      id: "ideation",
      title: "Ideation Stage",
      icon: Lightbulb,
      description: "For entrepreneurs with early-stage business ideas",
      details: [
        "You have a business concept but haven't launched yet",
        "No revenue or operations yet",
        "Looking to validate your idea",
        "Seeking initial funding",
      ],
      color: "from-blue-50 to-blue-100 border-blue-200",
    },
    {
      id: "active_business",
      title: "Active Business",
      icon: TrendingUp,
      description: "For entrepreneurs with existing operating businesses",
      details: [
        "You have an operational business",
        "Generating revenue or close to it",
        "Have customers and market traction",
        "Seeking expansion or growth funding",
      ],
      color: "from-emerald-50 to-emerald-100 border-emerald-200",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Choose Your Form Type</h1>
          <p className="text-muted-foreground mt-2">Select the form that best matches your business stage</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {forms.map((form) => {
            const Icon = form.icon
            return (
              <Card key={form.id} className={`border-2 hover:shadow-lg transition-all ${form.color}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{form.title}</CardTitle>
                  <CardDescription className="text-base">{form.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {form.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <span className="text-sm text-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <Button onClick={() => router.push(`/entrepreneur/intakes/create/${form.id}`)} className="w-full">
                    Start {form.title} Form
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-center">
          <Link href="/entrepreneur/intakes">
            <Button variant="outline">Back to Forms</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
