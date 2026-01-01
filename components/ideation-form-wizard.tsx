"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft } from "lucide-react"

interface IdeationFormData {
  // Founder Info
  full_name: string
  country: string
  date_of_birth: string
  gender: string
  phone: string
  email: string
  physical_address: string
  marital_status: string
  dependents: number

  // Employment
  current_employment_position: string
  current_employment_company: string
  education_degree: string
  education_institution: string

  // Business Concept
  business_name: string
  tagline: string
  industry: string
  idea_description: string
  problem_solved: string
  target_customers: string
  why_now: string

  // Market Understanding
  market_size: string
  competitors: string
  unique_value_proposition: string
  marketing_channels: string[]

  // Validation
  market_research_done: boolean
  customer_interviews_done: boolean

  // Funding
  funding_amount: number
  investor_type: string[]
  support_needed: string[]

  // Commitment
  education_level: string
  relevant_experience: string
  full_time_commitment: boolean

  // Service & Legal
  service_package: string
  agreed_to_terms: boolean
}

interface IdeationFormWizardProps {
  onSubmit: (data: IdeationFormData) => Promise<void>
  initialData?: Partial<IdeationFormData>
}

export function IdeationFormWizard({ onSubmit, initialData }: IdeationFormWizardProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<IdeationFormData>({
    full_name: initialData?.full_name || "",
    country: initialData?.country || "",
    date_of_birth: initialData?.date_of_birth || "",
    gender: initialData?.gender || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    physical_address: initialData?.physical_address || "",
    marital_status: initialData?.marital_status || "",
    dependents: initialData?.dependents || 0,
    current_employment_position: initialData?.current_employment_position || "",
    current_employment_company: initialData?.current_employment_company || "",
    education_degree: initialData?.education_degree || "",
    education_institution: initialData?.education_institution || "",
    business_name: initialData?.business_name || "",
    tagline: initialData?.tagline || "",
    industry: initialData?.industry || "",
    idea_description: initialData?.idea_description || "",
    problem_solved: initialData?.problem_solved || "",
    target_customers: initialData?.target_customers || "",
    why_now: initialData?.why_now || "",
    market_size: initialData?.market_size || "",
    competitors: initialData?.competitors || "",
    unique_value_proposition: initialData?.unique_value_proposition || "",
    marketing_channels: initialData?.marketing_channels || [],
    market_research_done: initialData?.market_research_done || false,
    customer_interviews_done: initialData?.customer_interviews_done || false,
    funding_amount: initialData?.funding_amount || 0,
    investor_type: initialData?.investor_type || [],
    support_needed: initialData?.support_needed || [],
    education_level: initialData?.education_level || "",
    relevant_experience: initialData?.relevant_experience || "",
    full_time_commitment: initialData?.full_time_commitment || false,
    service_package: initialData?.service_package || "standard",
    agreed_to_terms: initialData?.agreed_to_terms || false,
  })

  const totalSteps = 6
  const progress = (step / totalSteps) * 100

  const handleInputChange = (field: keyof IdeationFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const industries = [
    "Agritech",
    "Fintech",
    "HealthTech",
    "EdTech",
    "E-commerce",
    "SaaS",
    "Logistics",
    "Energy",
    "Real Estate",
    "Other",
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-text-bold">Ideation Stage Business Intake Form</CardTitle>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Founder & Contact Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Founder & Contact Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label>Country *</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Your country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+250..."
                />
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label>Physical Address</Label>
                <Input
                  value={formData.physical_address}
                  onChange={(e) => handleInputChange("physical_address", e.target.value)}
                  placeholder="Your address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Marital Status</Label>
                  <Select
                    value={formData.marital_status}
                    onValueChange={(value) => handleInputChange("marital_status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of Dependents</Label>
                  <Input
                    type="number"
                    value={formData.dependents}
                    onChange={(e) => handleInputChange("dependents", Number.parseInt(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Employment & Education */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Employment & Education</h3>

              <div>
                <Label>Current Position (if employed)</Label>
                <Input
                  value={formData.current_employment_position}
                  onChange={(e) => handleInputChange("current_employment_position", e.target.value)}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <Label>Current Company</Label>
                <Input
                  value={formData.current_employment_company}
                  onChange={(e) => handleInputChange("current_employment_company", e.target.value)}
                  placeholder="Company name"
                />
              </div>

              <div>
                <Label>Degree</Label>
                <Input
                  value={formData.education_degree}
                  onChange={(e) => handleInputChange("education_degree", e.target.value)}
                  placeholder="e.g., Bachelor's Degree"
                />
              </div>

              <div>
                <Label>Institution</Label>
                <Input
                  value={formData.education_institution}
                  onChange={(e) => handleInputChange("education_institution", e.target.value)}
                  placeholder="University/School name"
                />
              </div>
            </div>
          )}

          {/* Step 3: Business Concept */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Business Concept</h3>

              <div>
                <Label>Proposed Business Name *</Label>
                <Input
                  value={formData.business_name}
                  onChange={(e) => handleInputChange("business_name", e.target.value)}
                  placeholder="Business name"
                />
              </div>

              <div>
                <Label>Tagline/Slogan</Label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
                  placeholder="Your business tagline"
                />
              </div>

              <div>
                <Label>Industry Selection *</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Business Idea Description *</Label>
                <Textarea
                  value={formData.idea_description}
                  onChange={(e) => handleInputChange("idea_description", e.target.value)}
                  placeholder="Describe your business idea in detail"
                  rows={4}
                />
              </div>

              <div>
                <Label>Problem Being Solved *</Label>
                <Textarea
                  value={formData.problem_solved}
                  onChange={(e) => handleInputChange("problem_solved", e.target.value)}
                  placeholder="What problem does your business solve?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Target Customers *</Label>
                <Textarea
                  value={formData.target_customers}
                  onChange={(e) => handleInputChange("target_customers", e.target.value)}
                  placeholder="Who are your target customers?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Why Now?</Label>
                <Textarea
                  value={formData.why_now}
                  onChange={(e) => handleInputChange("why_now", e.target.value)}
                  placeholder="Why is now the right time for this business?"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Market Understanding */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Market Understanding</h3>

              <div>
                <Label>Estimated Market Size (Rwanda)</Label>
                <Textarea
                  value={formData.market_size}
                  onChange={(e) => handleInputChange("market_size", e.target.value)}
                  placeholder="Estimate the market size in Rwanda"
                  rows={3}
                />
              </div>

              <div>
                <Label>Competitors (3-5)</Label>
                <Textarea
                  value={formData.competitors}
                  onChange={(e) => handleInputChange("competitors", e.target.value)}
                  placeholder="List 3-5 key competitors"
                  rows={3}
                />
              </div>

              <div>
                <Label>Unique Value Proposition *</Label>
                <Textarea
                  value={formData.unique_value_proposition}
                  onChange={(e) => handleInputChange("unique_value_proposition", e.target.value)}
                  placeholder="What makes your business unique?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Market Research Conducted?</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.market_research_done}
                    onCheckedChange={(checked) => handleInputChange("market_research_done", checked)}
                  />
                  <span className="text-sm">Yes, I have conducted market research</span>
                </div>
              </div>

              <div>
                <Label>Customer Interviews Conducted?</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.customer_interviews_done}
                    onCheckedChange={(checked) => handleInputChange("customer_interviews_done", checked)}
                  />
                  <span className="text-sm">Yes, I have interviewed customers</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Funding & Support */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Funding & Support Needs</h3>

              <div>
                <Label>Funding Amount Needed (RWF) *</Label>
                <Input
                  type="number"
                  value={formData.funding_amount}
                  onChange={(e) => handleInputChange("funding_amount", Number.parseInt(e.target.value))}
                  placeholder="Enter amount in RWF"
                />
              </div>

              <div>
                <Label>Investor Type Seeking</Label>
                <div className="space-y-2">
                  {["Angel", "Grant", "Loan", "Shareholder"].map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.investor_type.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange("investor_type", [...formData.investor_type, type])
                          } else {
                            handleInputChange(
                              "investor_type",
                              formData.investor_type.filter((t) => t !== type),
                            )
                          }
                        }}
                      />
                      <span className="text-sm">{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Non-Financial Support Needed</Label>
                <div className="space-y-2">
                  {["Mentorship", "Legal", "Strategy", "Network"].map((support) => (
                    <div key={support} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.support_needed.includes(support)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange("support_needed", [...formData.support_needed, support])
                          } else {
                            handleInputChange(
                              "support_needed",
                              formData.support_needed.filter((s) => s !== support),
                            )
                          }
                        }}
                      />
                      <span className="text-sm">{support}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Commitment & Legal */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Founder Commitment & Service Package</h3>

              <div>
                <Label>Education Level</Label>
                <Select
                  value={formData.education_level}
                  onValueChange={(value) => handleInputChange("education_level", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Full-Time Commitment?</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.full_time_commitment}
                    onCheckedChange={(checked) => handleInputChange("full_time_commitment", checked)}
                  />
                  <span className="text-sm">I will work full-time on this business</span>
                </div>
              </div>

              <div>
                <Label>Service Package *</Label>
                <Select
                  value={formData.service_package}
                  onValueChange={(value) => handleInputChange("service_package", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard - Registration Fee Only</SelectItem>
                    <SelectItem value="elite">Elite - Includes Mentorship</SelectItem>
                    <SelectItem value="platinum">Platinum - Full Support Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Terms & Conditions</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Upfront service fee per selected package</li>
                  <li>• 9% success fee upon funding (deducted from funding)</li>
                  <li>• Information shared is confidential</li>
                  <li>• Governed by Rwandan law</li>
                </ul>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  checked={formData.agreed_to_terms}
                  onCheckedChange={(checked) => handleInputChange("agreed_to_terms", checked)}
                />
                <Label className="text-sm">I agree to the terms and conditions *</Label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={step === 1} className="gap-2 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {step === totalSteps ? (
              <Button onClick={handleSubmit} disabled={!formData.agreed_to_terms || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Form"}
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
