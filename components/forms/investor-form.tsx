"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, ChevronLeft } from "lucide-react"

const INDUSTRIES = [
  "Agritech",
  "Fintech",
  "Renewable Energy",
  "HealthTech",
  "EdTech",
  "Tourism & Hospitality",
  "Manufacturing",
  "E-commerce",
  "Logistics",
  "Other",
]
const INVESTMENT_STAGES = ["Pre-seed (Ideation)", "Growth Stage", "All Stages"]
const INVESTMENT_TYPES = ["Equity", "Debt", "Convertible Note", "Grant", "Hybrid"]
const GEOGRAPHY = ["Rwanda Only", "East Africa", "Pan-Africa", "Global"]
const COMMUNICATION = ["Email", "Phone", "WhatsApp", "In-person"]

interface InvestorFormProps {
  onSubmit: (data: Record<string, any>) => void
  isLoading: boolean
  initialData?: Record<string, any>
}

export default function InvestorForm({ onSubmit, isLoading, initialData }: InvestorFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Section A: Personal Info
    full_legal_name: "",
    preferred_name: "",
    title: "",
    fund_name: "",
    position_in_fund: "",
    email: "",
    phone: "",
    whatsapp: "",

    // Section B: Investment Criteria
    industries_interested: [] as string[],
    investment_stage: "",
    min_investment: "",
    max_investment: "",
    geographic_focus: "",
    investment_types_interested: [] as string[],

    // Section C: Background & Experience
    years_investing: "",
    num_investments: "",
    investment_philosophy: "",

    // Section D: Compliance
    kyc_aml_compliant: false,
    preferred_communication: "",
    how_heard: "",

    // Section E: Agreement
    agree_to_network: false,
    agree_to_fee_understanding: false,
    agree_to_confidentiality: false,
    ...(initialData || {}),
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: string, value: string, isChecked: boolean) => {
    setFormData((prev) => {
      const current = prev[field as keyof typeof prev] as string[]
      return {
        ...prev,
        [field]: isChecked ? [...current, value] : current.filter((v) => v !== value),
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const steps = [
    { title: "Personal Info", icon: "👤" },
    { title: "Investment Criteria", icon: "📊" },
    { title: "Experience", icon: "💼" },
    { title: "Compliance", icon: "✅" },
    { title: "Agreement", icon: "✍️" },
  ]

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {steps.map((s, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium mb-2 ${
                    step > idx + 1 ? "bg-green-600 text-white" : step === idx + 1 ? "bg-primary text-white" : "bg-muted"
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="text-xs text-center text-muted-foreground">{s.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_legal_name">Full Legal Name *</Label>
                  <Input
                    id="full_legal_name"
                    value={formData.full_legal_name}
                    onChange={(e) => handleInputChange("full_legal_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preferred_name">Preferred Name/Title</Label>
                  <Select value={formData.title} onValueChange={(v) => handleInputChange("title", v)}>
                    <SelectTrigger id="preferred_name">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Mr</SelectItem>
                      <SelectItem value="mrs">Mrs</SelectItem>
                      <SelectItem value="ms">Ms</SelectItem>
                      <SelectItem value="dr">Dr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Name of Fund/Entity (if applicable)"
                  value={formData.fund_name}
                  onChange={(e) => handleInputChange("fund_name", e.target.value)}
                />
                <Input
                  placeholder="Position/Title in Entity"
                  value={formData.position_in_fund}
                  onChange={(e) => handleInputChange("position_in_fund", e.target.value)}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
                <Input
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <Input
                placeholder="WhatsApp"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange("whatsapp", e.target.value)}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Investment Criteria */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Investment Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Industries of Interest (Check all that apply) *</Label>
                {INDUSTRIES.map((industry) => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={`industry-${industry}`}
                      checked={formData.industries_interested.includes(industry)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("industries_interested", industry, checked as boolean)
                      }
                    />
                    <label htmlFor={`industry-${industry}`} className="text-sm cursor-pointer">
                      {industry}
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="investment_stage">Investment Stage Preference *</Label>
                <Select
                  value={formData.investment_stage}
                  onValueChange={(v) => handleInputChange("investment_stage", v)}
                >
                  <SelectTrigger id="investment_stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage.toLowerCase()}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-3 block">Typical Investment Size Range (RWF) *</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Minimum"
                    value={formData.min_investment}
                    onChange={(e) => handleInputChange("min_investment", e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Maximum"
                    value={formData.max_investment}
                    onChange={(e) => handleInputChange("max_investment", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="geographic_focus">Geographic Focus *</Label>
                <Select
                  value={formData.geographic_focus}
                  onValueChange={(v) => handleInputChange("geographic_focus", v)}
                >
                  <SelectTrigger id="geographic_focus">
                    <SelectValue placeholder="Select geography" />
                  </SelectTrigger>
                  <SelectContent>
                    {GEOGRAPHY.map((geo) => (
                      <SelectItem key={geo} value={geo.toLowerCase()}>
                        {geo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Preferred Investment Type *</Label>
                {INVESTMENT_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={formData.investment_types_interested.includes(type)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("investment_types_interested", type, checked as boolean)
                      }
                    />
                    <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Experience */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Background & Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Years of Investing Experience *"
                  value={formData.years_investing}
                  onChange={(e) => handleInputChange("years_investing", e.target.value)}
                  required
                />
                <Input
                  type="number"
                  placeholder="Number of Previous Investments Made"
                  value={formData.num_investments}
                  onChange={(e) => handleInputChange("num_investments", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="investment_philosophy">Briefly describe your investment philosophy or focus</Label>
                <Textarea
                  id="investment_philosophy"
                  value={formData.investment_philosophy}
                  onChange={(e) => handleInputChange("investment_philosophy", e.target.value)}
                  rows={4}
                  placeholder="Tell us about your investment approach and focus areas"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Compliance */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Documentation & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="kyc_compliant"
                    checked={formData.kyc_aml_compliant}
                    onCheckedChange={(checked) => handleInputChange("kyc_aml_compliant", checked)}
                  />
                  <label htmlFor="kyc_compliant" className="text-sm cursor-pointer">
                    Are you KYC/AML compliant?
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="preferred_communication">Preferred Communication Method *</Label>
                <Select
                  value={formData.preferred_communication}
                  onValueChange={(v) => handleInputChange("preferred_communication", v)}
                >
                  <SelectTrigger id="preferred_communication">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMUNICATION.map((method) => (
                      <SelectItem key={method} value={method.toLowerCase()}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="how_heard">How did you hear about SkySolution?</Label>
                <Input
                  id="how_heard"
                  value={formData.how_heard}
                  onChange={(e) => handleInputChange("how_heard", e.target.value)}
                  placeholder="Website, Referral, Event, etc."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Agreement */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Agreement & Confidentiality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree_network"
                    checked={formData.agree_to_network}
                    onCheckedChange={(checked) => handleInputChange("agree_to_network", checked)}
                  />
                  <label htmlFor="agree_network" className="text-sm cursor-pointer">
                    I agree to be included in SkySolution's curated investor network and to receive qualified startup
                    introductions. *
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree_fee"
                    checked={formData.agree_to_fee_understanding}
                    onCheckedChange={(checked) => handleInputChange("agree_to_fee_understanding", checked)}
                  />
                  <label htmlFor="agree_fee" className="text-sm cursor-pointer">
                    I understand that SkySolution acts as a broker and may receive a fee from entrepreneurs upon
                    successful funding. *
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree_confidentiality"
                    checked={formData.agree_to_confidentiality}
                    onCheckedChange={(checked) => handleInputChange("agree_to_confidentiality", checked)}
                  />
                  <label htmlFor="agree_confidentiality" className="text-sm cursor-pointer">
                    I agree to maintain confidentiality regarding startup information shared during introductions. *
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {step < 5 ? (
            <Button type="button" onClick={() => setStep(Math.min(5, step + 1))}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.agree_to_network ||
                !formData.agree_to_fee_understanding ||
                !formData.agree_to_confidentiality
              }
            >
              {isLoading ? "Submitting..." : "Submit Form"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
