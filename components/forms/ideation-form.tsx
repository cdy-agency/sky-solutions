"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  "Tourism",
  "Manufacturing",
  "E-commerce",
  "HealthTech",
  "Education",
  "Other",
]
const MARKETING_CHANNELS = ["Social Media", "Referrals", "Partnerships", "Advertising", "Events", "Other"]
const INVESTOR_TYPES = ["Angel Investor", "Shareholder", "Paternal", "Bank Loan", "Grant", "Other"]
const SUPPORT_TYPES = ["Mentorship", "Network", "Business Strategy", "Legal", "Accounting", "Other"]

interface IdeationFormProps {
  onSubmit: (data: Record<string, any>) => void
  isLoading: boolean
  initialData?: Record<string, any>
}

export default function IdeationForm({ onSubmit, isLoading, initialData }: IdeationFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Part A: Founder Info
    full_name: "",
    country: "",
    national_id: "",
    date_of_birth: "",
    phone: "",
    email: "",
    physical_address: "",
    gender: "",
    marital_status: "",
    dependents: "",
    current_occupation: "",

    // Employment & Education
    current_employment: { position: "", company: "", start_date: "", salary: "" },
    previous_employment: [{ company: "", position: "", dates: "" }],
    education: { degree: "", institution: "", year: "", field: "" },
    entrepreneurial_exp: "",
    work_experience: "",
    education_level: "",

    // Part B: Business Concept
    business_name: "",
    tagline: "",
    industry: "",
    idea_description: "",
    problem_solved: "",
    target_customers: "",
    why_now: "",

    // Part C: Market
    market_size: "",
    competitors: "",
    unique_value_proposition: "",
    marketing_channels: [] as string[],

    // Part D: Planning
    market_research_done: false,
    market_research_description: "",
    customer_interviews_done: false,
    customer_interviews_feedback: "",

    // Part E: Funding
    funding_amount: "",
    product_dev: "",
    marketing: "",
    operations: "",
    salaries: "",
    other_allocation: "",
    investor_type_seeking: [] as string[],
    support_needed: [] as string[],

    // Part F: Founder Background
    why_right_person: "",
    full_time: false,
    how_heard: "",
    service_package: "",

    agreed_to_terms: false,
    agreed_to_fees: false,
    agreed_to_confidentiality: false,
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
    { title: "Founder Information", icon: "👤" },
    { title: "Business Concept", icon: "💡" },
    { title: "Market Understanding", icon: "📊" },
    { title: "Planning & Research", icon: "🔍" },
    { title: "Funding Needs", icon: "💰" },
    { title: "Terms & Signature", icon: "✍️" },
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
        {/* Part A: Founder Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Founder & Contact Information</CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="national_id">National ID/Passport</Label>
                  <Input
                    id="national_id"
                    value={formData.national_id}
                    onChange={(e) => handleInputChange("national_id", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="marital_status">Marital Status</Label>
                  <Select value={formData.marital_status} onValueChange={(v) => handleInputChange("marital_status", v)}>
                    <SelectTrigger id="marital_status">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="physical_address">Physical Address</Label>
                <Input
                  id="physical_address"
                  value={formData.physical_address}
                  onChange={(e) => handleInputChange("physical_address", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="dependents">Number of Dependents</Label>
                <Input
                  id="dependents"
                  type="number"
                  value={formData.dependents}
                  onChange={(e) => handleInputChange("dependents", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="current_occupation">Current Occupation</Label>
                <Input
                  id="current_occupation"
                  value={formData.current_occupation}
                  onChange={(e) => handleInputChange("current_occupation", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="how_heard">How did you hear about Sky Solutions?</Label>
                <Input
                  id="how_heard"
                  value={formData.how_heard}
                  onChange={(e) => handleInputChange("how_heard", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Part B: Business Concept */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Business Concept</CardTitle>
              <CardDescription>Describe your business idea</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name (Proposed) *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange("business_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline/Slogan</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => handleInputChange("tagline", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="industry">Industry Sector *</Label>
                <Select value={formData.industry} onValueChange={(v) => handleInputChange("industry", v)}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind.toLowerCase()}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="idea_description">Describe your business idea in detail *</Label>
                <Textarea
                  id="idea_description"
                  value={formData.idea_description}
                  onChange={(e) => handleInputChange("idea_description", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="problem_solved">What problem are you solving? *</Label>
                <Textarea
                  id="problem_solved"
                  value={formData.problem_solved}
                  onChange={(e) => handleInputChange("problem_solved", e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="target_customers">Who experiences this problem? (Target Customer Profile) *</Label>
                <Textarea
                  id="target_customers"
                  value={formData.target_customers}
                  onChange={(e) => handleInputChange("target_customers", e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="why_now">Why is now the right time for this solution?</Label>
                <Textarea
                  id="why_now"
                  value={formData.why_now}
                  onChange={(e) => handleInputChange("why_now", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Part C: Market Understanding */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Market Understanding</CardTitle>
              <CardDescription>Analyze your market and competition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="market_size">Estimated Target Market Size in Rwanda</Label>
                <Input
                  id="market_size"
                  value={formData.market_size}
                  onChange={(e) => handleInputChange("market_size", e.target.value)}
                  placeholder="e.g., 500,000 people"
                />
              </div>

              <div>
                <Label htmlFor="competitors">Who are your potential competitors? (List 3-5)</Label>
                <Textarea
                  id="competitors"
                  value={formData.competitors}
                  onChange={(e) => handleInputChange("competitors", e.target.value)}
                  rows={3}
                  placeholder="Company 1&#10;Company 2&#10;Company 3"
                />
              </div>

              <div>
                <Label htmlFor="unique_value_proposition">
                  What will make your solution different/better? (Unique Value Proposition) *
                </Label>
                <Textarea
                  id="unique_value_proposition"
                  value={formData.unique_value_proposition}
                  onChange={(e) => handleInputChange("unique_value_proposition", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>How will customers find out about you? (Marketing channels)</Label>
                {MARKETING_CHANNELS.map((channel) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox
                      id={`channel-${channel}`}
                      checked={formData.marketing_channels.includes(channel)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("marketing_channels", channel, checked as boolean)
                      }
                    />
                    <label htmlFor={`channel-${channel}`} className="text-sm cursor-pointer">
                      {channel}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Part D: Planning */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Preliminary Planning</CardTitle>
              <CardDescription>Tell us about your research and validation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Have you conducted any market research?</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="market-yes"
                      checked={formData.market_research_done}
                      onCheckedChange={() => handleInputChange("market_research_done", true)}
                    />
                    <label htmlFor="market-yes" className="text-sm cursor-pointer">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="market-no"
                      checked={!formData.market_research_done}
                      onCheckedChange={() => handleInputChange("market_research_done", false)}
                    />
                    <label htmlFor="market-no" className="text-sm cursor-pointer">
                      No
                    </label>
                  </div>
                </div>
              </div>

              {formData.market_research_done && (
                <div>
                  <Label htmlFor="market_research_description">If yes, describe methods/findings:</Label>
                  <Textarea
                    id="market_research_description"
                    value={formData.market_research_description}
                    onChange={(e) => handleInputChange("market_research_description", e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label>Have you spoken with potential customers?</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="customer-yes"
                      checked={formData.customer_interviews_done}
                      onCheckedChange={() => handleInputChange("customer_interviews_done", true)}
                    />
                    <label htmlFor="customer-yes" className="text-sm cursor-pointer">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="customer-no"
                      checked={!formData.customer_interviews_done}
                      onCheckedChange={() => handleInputChange("customer_interviews_done", false)}
                    />
                    <label htmlFor="customer-no" className="text-sm cursor-pointer">
                      No
                    </label>
                  </div>
                </div>
              </div>

              {formData.customer_interviews_done && (
                <div>
                  <Label htmlFor="customer_interviews_feedback">If yes, what feedback did you receive?</Label>
                  <Textarea
                    id="customer_interviews_feedback"
                    value={formData.customer_interviews_feedback}
                    onChange={(e) => handleInputChange("customer_interviews_feedback", e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Part E: Funding */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Funding & Support Needs</CardTitle>
              <CardDescription>Tell us about your funding requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="funding_amount">Amount of funding needed (RWF) *</Label>
                <Input
                  id="funding_amount"
                  type="number"
                  value={formData.funding_amount}
                  onChange={(e) => handleInputChange("funding_amount", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label className="mb-3 block">How will the funds be used? (Breakdown - percentages)</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product_dev" className="text-sm">
                      Product Development %
                    </Label>
                    <Input
                      id="product_dev"
                      type="number"
                      value={formData.product_dev}
                      onChange={(e) => handleInputChange("product_dev", e.target.value)}
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="marketing" className="text-sm">
                      Marketing %
                    </Label>
                    <Input
                      id="marketing"
                      type="number"
                      value={formData.marketing}
                      onChange={(e) => handleInputChange("marketing", e.target.value)}
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operations" className="text-sm">
                      Operations %
                    </Label>
                    <Input
                      id="operations"
                      type="number"
                      value={formData.operations}
                      onChange={(e) => handleInputChange("operations", e.target.value)}
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaries" className="text-sm">
                      Salaries %
                    </Label>
                    <Input
                      id="salaries"
                      type="number"
                      value={formData.salaries}
                      onChange={(e) => handleInputChange("salaries", e.target.value)}
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="other_allocation" className="text-sm">
                      Other %
                    </Label>
                    <Input
                      id="other_allocation"
                      type="number"
                      value={formData.other_allocation}
                      onChange={(e) => handleInputChange("other_allocation", e.target.value)}
                      max="100"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>What type of investor are you seeking?</Label>
                {INVESTOR_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`investor-${type}`}
                      checked={formData.investor_type_seeking.includes(type)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("investor_type_seeking", type, checked as boolean)
                      }
                    />
                    <label htmlFor={`investor-${type}`} className="text-sm cursor-pointer">
                      {type}
                    </label>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Label>What other support do you need besides funding?</Label>
                {SUPPORT_TYPES.map((support) => (
                  <div key={support} className="flex items-center space-x-2">
                    <Checkbox
                      id={`support-${support}`}
                      checked={formData.support_needed.includes(support)}
                      onCheckedChange={(checked) => handleCheckboxChange("support_needed", support, checked as boolean)}
                    />
                    <label htmlFor={`support-${support}`} className="text-sm cursor-pointer">
                      {support}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Part F: Founder Background */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle>Founder Background</CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="education_level">Highest Level of Education *</Label>
                <Input
                  id="education_level"
                  value={formData.education_level}
                  onChange={(e) => handleInputChange("education_level", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="work_experience">Relevant Work Experience *</Label>
                <Textarea
                  id="work_experience"
                  value={formData.work_experience}
                  onChange={(e) => handleInputChange("work_experience", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="entrepreneurial_exp">Previous Entrepreneurial Experience</Label>
                <Textarea
                  id="entrepreneurial_exp"
                  value={formData.entrepreneurial_exp}
                  onChange={(e) => handleInputChange("entrepreneurial_exp", e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="why_right_person">Why are you the right person to execute this idea? *</Label>
                <Textarea
                  id="why_right_person"
                  value={formData.why_right_person}
                  onChange={(e) => handleInputChange("why_right_person", e.target.value)}
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Please provide at least 10 characters explaining why you're the right person"
                />
                {formData.why_right_person && formData.why_right_person.length < 10 && (
                  <p className="text-sm text-red-600 mt-1">Please provide at least 10 characters</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Full-time commitment? *</Label>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="full_time-yes"
                      checked={formData.full_time}
                      onCheckedChange={() => handleInputChange("full_time", true)}
                    />
                    <label htmlFor="full_time-yes" className="text-sm cursor-pointer">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="full_time-no"
                      checked={!formData.full_time}
                      onCheckedChange={() => handleInputChange("full_time", false)}
                    />
                    <label htmlFor="full_time-no" className="text-sm cursor-pointer">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="service_package">Which Sky Solution package are you interested in? *</Label>
                <Select value={formData.service_package} onValueChange={(v) => handleInputChange("service_package", v)}>
                  <SelectTrigger id="service_package">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Part G: Terms & Agreement */}
        {step === 7 && (
          <Card>
            <CardHeader>
              <CardTitle>Terms & Agreement</CardTitle>
              <CardDescription>Legal agreement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  By engaging our services, you agree to these terms. We provide business plan development, pitch deck
                  creation, and investor matchmaking. Clients pay an upfront service fee based on their chosen package
                  (Standard, Elite, Platinum). Upon securing investment from an investor, a success fee of 9% of the
                  total investment amount is payable within 14 days of fund receipt. All client information is
                  confidential and secure. We retain IP rights to our methodologies, while you own the final
                  deliverables. We strive to facilitate connections but do not guarantee funding. Disputes shall be
                  governed by Rwandan law.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreed_to_terms"
                    checked={formData.agreed_to_terms}
                    onCheckedChange={(checked) => handleInputChange("agreed_to_terms", checked)}
                  />
                  <label htmlFor="agreed_to_terms" className="text-sm cursor-pointer">
                    I agree to the terms and conditions *
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreed_to_fees"
                    checked={formData.agreed_to_fees}
                    onCheckedChange={(checked) => handleInputChange("agreed_to_fees", checked)}
                  />
                  <label htmlFor="agreed_to_fees" className="text-sm cursor-pointer">
                    I agree to pay service fees required for delivery and the success fee obligation survives service
                    termination *
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreed_to_confidentiality"
                    checked={formData.agreed_to_confidentiality}
                    onCheckedChange={(checked) => handleInputChange("agreed_to_confidentiality", checked)}
                  />
                  <label htmlFor="agreed_to_confidentiality" className="text-sm cursor-pointer">
                    I agree to maintain confidentiality regarding startup information *
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

          {step < 7 ? (
            <Button type="button" onClick={() => setStep(Math.min(7, step + 1))}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.agreed_to_terms ||
                !formData.agreed_to_fees ||
                !formData.agreed_to_confidentiality
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
