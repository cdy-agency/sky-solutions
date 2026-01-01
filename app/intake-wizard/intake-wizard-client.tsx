"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { intakeApi } from "@/lib/api"
import IdeationForm from "@/components/forms/ideation-form"
import InvestorForm from "@/components/forms/investor-form"

export default function IntakeWizardClient() {
  const { user, logout,token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  if (!user || (user.role !== "entrepreneur" && user.role !== "investor")) {
    return null
  }

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)
    try {
      const formType = user.role === "entrepreneur" ? "ideation" : "investor"
      await intakeApi.submitIntake({
        ...formData,
        form_type: formType,
      }, token as string)

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

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            {user.role === "entrepreneur"
              ? "Tell us about your business idea so we can help you find the right investors"
              : "Help us understand your investment preferences"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.role === "entrepreneur" ? (
            <IdeationForm onSubmit={handleSubmit} isLoading={isLoading} />
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
