"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { intakeApi } from "@/lib/api"
import IdeationForm from "@/components/forms/ideation-form"
import ActiveBusinessForm from "@/components/forms/active-business-form"
import InvestorForm from "@/components/forms/investor-form"
import { Lightbulb, TrendingUp, ArrowRight } from "lucide-react"

export default function IntakeWizardClient() {
  const { user, logout, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFormType, setSelectedFormType] = useState<"ideation" | "active_business" | null>(null)

  if (!user || (user.role !== "entrepreneur" && user.role !== "investor")) {
    return null
  }

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)
    try {
      const formType = user.role === "entrepreneur" ? selectedFormType : "investor"
      if (!formType) {
        toast({
          title: "Error",
          description: "Please select a form type",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      await intakeApi.submitIntake(
        {
          ...formData,
          form_type: formType,
        },
        token as string,
      )

      // Update user in context
      const updatedUser = { ...user, intake_completed: true }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      toast({
        title: "Success",
        description: "Your intake form has been submitted successfully",
      })

      router.push(user.role === "entrepreneur" ? "/entrepreneur" : "/investor")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    logout()
  }

  // Show form type selection for entrepreneurs
  if (user.role === "entrepreneur" && !selectedFormType) {
    const forms = [
      {
        id: "ideation" as const,
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
        id: "active_business" as const,
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
      <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
            <p className="text-muted-foreground mt-2">Select the form that best matches your business stage</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {forms.map((form) => {
              const Icon = form.icon
              return (
                <Card key={form.id} className={`border-2 hover:shadow-lg transition-all cursor-pointer ${form.color}`}>
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
                    <Button
                      onClick={() => setSelectedFormType(form.id)}
                      className="w-full"
                      size="lg"
                    >
                      Start {form.title} Form
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={handleSkip}>
              Skip for Now
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show the appropriate form based on selection
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            {user.role === "entrepreneur"
              ? selectedFormType === "ideation"
                ? "Tell us about your business idea so we can help you find the right investors"
                : "Tell us about your active business so we can help you find the right investors"
              : "Help us understand your investment preferences"}
          </CardDescription>
          {user.role === "entrepreneur" && selectedFormType && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFormType(null)}
              className="mt-2"
            >
              ← Change Form Type
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {user.role === "entrepreneur" ? (
            selectedFormType === "ideation" ? (
              <IdeationForm onSubmit={handleSubmit} isLoading={isLoading} />
            ) : selectedFormType === "active_business" ? (
              <ActiveBusinessForm onSubmit={handleSubmit} isLoading={isLoading} />
            ) : null
          ) : (
            <InvestorForm onSubmit={handleSubmit} isLoading={isLoading} />
          )}

          <div className="mt-6 flex gap-4">
            <Button variant="outline" onClick={handleSkip} disabled={isLoading} className="flex-1 bg-transparent">
              Skip for Now
            </Button>
            <p className="text-sm text-muted-foreground text-center flex-1 flex items-center justify-center">
              You can complete this later in your dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
