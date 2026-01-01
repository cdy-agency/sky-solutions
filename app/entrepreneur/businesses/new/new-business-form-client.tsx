"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { entrepreneurApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"

export default function NewBusinessFormClient() {
  const { token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const businessType = searchParams.get("type") || "ideation"

  const [formData, setFormData] = useState({
    title: "",
  })
  const [businessPlan, setBusinessPlan] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Error",
          description: `File size exceeds 2MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          variant: "destructive",
        })
        return
      }

      if (file.type !== "application/pdf") {
        toast({ title: "Error", description: "Please upload a PDF file", variant: "destructive" })
        return
      }
      setBusinessPlan(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (!formData.title || !businessPlan) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const data = new FormData()
      data.append("title", formData.title)
      data.append("business_plan", businessPlan)

      await entrepreneurApi.createBusiness(data, token)
      toast({ title: "Success", description: "Business submitted successfully. Admin will review it soon." })
      router.push("/entrepreneur/businesses")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const typeLabel = businessType === "ideation" ? "Ideation Stage" : "Active Business"

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Submit {typeLabel} Business for Review</CardTitle>
            <CardDescription>
              Submit your business details for admin review. Your business plan and information will be carefully
              analyzed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Business Name *</Label>
                <Input
                  id="title"
                  placeholder="Enter your business name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Business Plan (PDF) *</Label>
                <p className="text-sm text-muted-foreground">
                  Upload your detailed business plan. Maximum file size: 2MB
                </p>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {businessPlan ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{businessPlan.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(businessPlan.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setBusinessPlan(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium text-foreground">Click to upload PDF</span>
                      <span className="text-xs text-muted-foreground">PDF files only, max 2MB</span>
                      <input type="file" accept=".pdf" className="hidden" onChange={handlePdfChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Next Steps:</span> After submission, our admin team will review your
                  business plan and details. Once approved, your business will be visible to investors.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit for Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
