"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, ChevronLeft, Plus, Trash2 } from "lucide-react"

const INDUSTRIES = [
  "Agritech",
  "Fintech",
  "Renewable Energy",
  "Tourism",
  "Manufacturing",
  "Retail",
  "Services",
  "Other",
]
const BUSINESS_STAGES = ["Pre-revenue", "Early Revenue (<6 months)", "Growth Stage (>6 months)", "Mature"]

// Map display values to backend enum values
const mapBusinessStageToEnum = (displayValue: string): string => {
  const mapping: Record<string, string> = {
    "pre-revenue": "pre-revenue",
    "Pre-revenue": "pre-revenue",
    "early revenue (<6 months)": "early",
    "Early Revenue (<6 months)": "early",
    "growth stage (>6 months)": "growth",
    "Growth Stage (>6 months)": "growth",
    "mature": "mature",
    "Mature": "mature",
  }
  return mapping[displayValue] || displayValue
}

// Map backend enum values to display values (for editing)
const mapBusinessStageFromEnum = (enumValue: string): string => {
  const mapping: Record<string, string> = {
    "pre-revenue": "Pre-revenue",
    "early": "Early Revenue (<6 months)",
    "growth": "Growth Stage (>6 months)",
    "mature": "Mature",
  }
  return mapping[enumValue] || enumValue
}
const FUNDING_SOURCES = ["Bootstrapped", "Friends & Family", "Angel", "Grant", "Other"]
const FUNDING_TYPES = ["Equity", "Debt", "Partner", "Grant", "Other"]
const INVESTOR_TYPES = ["Angel Investor", "Shareholder", "Paternal", "Bank Loan", "Grant", "Other"]
const SUPPORT_TYPES = ["Mentorship", "Network", "Business Strategy", "Legal", "Accounting", "Other"]
const PACKAGES = ["Standard", "Elite", "Platinum"]

interface TeamMember {
  name: string
  position: string
  ownership: string
  salary: string
  years: string
}

interface ActiveBusinessFormProps {
  onSubmit: (data: Record<string, any>) => void
  isLoading: boolean
  initialData?: Record<string, any>
}

export default function ActiveBusinessForm({ onSubmit, isLoading, initialData }: ActiveBusinessFormProps) {
  const [step, setStep] = useState(1)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: "", position: "", ownership: "", salary: "", years: "" },
  ])
  const [formData, setFormData] = useState({
    // Part A: Founder Info (same as ideation)
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
    how_heard: "",

    // Employment & Education
    current_employment: { position: "", company: "", start_date: "", salary: "" },
    previous_employment: [{ company: "", position: "" }],
    education: { degree: "", institution: "", year: "", field: "" },

    // Business Info
    business_legal_name: "",
    trading_name: "",
    registration_number: "",
    date_of_incorporation: "",
    business_address: "",
    website: "",
    business_phone: "",
    business_email: "",
    primary_contact: "",
    primary_contact_position: "",

    // Operations
    industry: "",
    fulltime_employees: "",
    parttime_employees: "",
    business_stage: "",
    business_model: "",
    main_products: "",

    // Financial
    revenue_month1: "",
    revenue_month2: "",
    revenue_month3: "",
    monthly_expenses: "",
    profit_margin: "",
    bank_balance: "",
    outstanding_debts: "",
    previous_funding_source: "",
    previous_funding_amount: "",
    previous_funding_date: "",

    // Market
    customer_base: "",
    cac: "",
    ltv: "",
    monthly_growth: "",
    competitors: "",
    partnerships: "",

    // Funding
    funding_amount: "",
    funding_type: "",
    valuation: "",
    marketing_sales: "",
    product_dev: "",
    team_expansion: "",
    operations: "",
    debt_repayment: "",
    other_allocation: "",
    expected_milestones: "",
    investor_types: [] as string[],
    support_needed: [] as string[],

    // Service & Legal
    agreed_to_terms: false,
    agreed_to_fees: false,
    agreed_to_confidentiality: false,
    ...(initialData || {}),
    // Map business_stage from enum to display value if editing (must be after spread to override)
    business_stage: initialData?.business_stage ? mapBusinessStageFromEnum(initialData.business_stage) : "",
  })

  // Initialize team members from initialData if provided
  useEffect(() => {
    if (initialData?.team_members && Array.isArray(initialData.team_members) && initialData.team_members.length > 0) {
      setTeamMembers(
        initialData.team_members.map((member: any) => ({
          name: member.name || "",
          position: member.position || "",
          ownership: member.ownership_percentage?.toString() || "",
          salary: member.salary?.toString() || "",
          years: member.years_with_company?.toString() || "",
        })),
      )
    }
  }, [initialData])

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

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...teamMembers]
    newMembers[index][field] = value
    setTeamMembers(newMembers)
  }

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", position: "", ownership: "", salary: "", years: "" }])
  }

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Map business_stage to backend enum value
    const submitData = {
      ...formData,
      business_stage: formData.business_stage ? mapBusinessStageToEnum(formData.business_stage) : undefined,
      team_members: teamMembers,
    }
    onSubmit(submitData)
  }

  const steps = [
    { title: "Founder Info", icon: "👤" },
    { title: "Business Info", icon: "🏢" },
    { title: "Operations", icon: "⚙️" },
    { title: "Financials", icon: "📊" },
    { title: "Market Position", icon: "📈" },
    { title: "Funding & Team", icon: "💼" },
    { title: "Terms", icon: "✍️" },
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
        {/* Step 1: Founder Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Founder & Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name *"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  required
                />
                <Input
                  placeholder="Country *"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  required
                />
                <Input
                  placeholder="National ID/Passport"
                  value={formData.national_id}
                  onChange={(e) => handleInputChange("national_id", e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="Date of Birth"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                />
                <Input
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <Input
                placeholder="Physical Address"
                value={formData.physical_address}
                onChange={(e) => handleInputChange("physical_address", e.target.value)}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Business Info */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Business & Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Business Legal Name *"
                  value={formData.business_legal_name}
                  onChange={(e) => handleInputChange("business_legal_name", e.target.value)}
                  required
                />
                <Input
                  placeholder="Trading Name (if different)"
                  value={formData.trading_name}
                  onChange={(e) => handleInputChange("trading_name", e.target.value)}
                />
                <Input
                  placeholder="Business Registration Number *"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange("registration_number", e.target.value)}
                  required
                />
                <Input
                  type="date"
                  placeholder="Date of Incorporation"
                  value={formData.date_of_incorporation}
                  onChange={(e) => handleInputChange("date_of_incorporation", e.target.value)}
                />
                <Input
                  placeholder="Website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
                <Input
                  placeholder="Business Phone"
                  value={formData.business_phone}
                  onChange={(e) => handleInputChange("business_phone", e.target.value)}
                />
                <Input
                  placeholder="Business Email"
                  value={formData.business_email}
                  onChange={(e) => handleInputChange("business_email", e.target.value)}
                />
              </div>
              <Input
                placeholder="Physical Business Address"
                value={formData.business_address}
                onChange={(e) => handleInputChange("business_address", e.target.value)}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 3: Operations */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Business Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Full-time Employees"
                  value={formData.fulltime_employees}
                  onChange={(e) => handleInputChange("fulltime_employees", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Part-time Employees"
                  value={formData.parttime_employees}
                  onChange={(e) => handleInputChange("parttime_employees", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="business_stage">Current Business Stage *</Label>
                <Select value={formData.business_stage} onValueChange={(v) => handleInputChange("business_stage", v)}>
                  <SelectTrigger id="business_stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="Business Model Description (How do you make money?)"
                value={formData.business_model}
                onChange={(e) => handleInputChange("business_model", e.target.value)}
                rows={4}
              />

              <Textarea
                placeholder="Main Products/Services"
                value={formData.main_products}
                onChange={(e) => handleInputChange("main_products", e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 4: Financials */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Monthly Revenue (Last 3 Months) - RWF</Label>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Input
                    type="number"
                    placeholder="Month 1"
                    value={formData.revenue_month1}
                    onChange={(e) => handleInputChange("revenue_month1", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Month 2"
                    value={formData.revenue_month2}
                    onChange={(e) => handleInputChange("revenue_month2", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Month 3"
                    value={formData.revenue_month3}
                    onChange={(e) => handleInputChange("revenue_month3", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Monthly Expenses (average) - RWF"
                  value={formData.monthly_expenses}
                  onChange={(e) => handleInputChange("monthly_expenses", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Current Profit Margin %"
                  value={formData.profit_margin}
                  onChange={(e) => handleInputChange("profit_margin", e.target.value)}
                  max="100"
                />
                <Input
                  type="number"
                  placeholder="Bank Balance - RWF"
                  value={formData.bank_balance}
                  onChange={(e) => handleInputChange("bank_balance", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Outstanding Loans/Debts - RWF"
                  value={formData.outstanding_debts}
                  onChange={(e) => handleInputChange("outstanding_debts", e.target.value)}
                />
              </div>

              <div>
                <Label>Previous Funding</Label>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Select
                    value={formData.previous_funding_source}
                    onValueChange={(v) => handleInputChange("previous_funding_source", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Funding source" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNDING_SOURCES.map((src) => (
                        <SelectItem key={src} value={src.toLowerCase()}>
                          {src}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Amount - RWF"
                    value={formData.previous_funding_amount}
                    onChange={(e) => handleInputChange("previous_funding_amount", e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="Date"
                    value={formData.previous_funding_date}
                    onChange={(e) => handleInputChange("previous_funding_date", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Market Position */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Market Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Current Customer Base Size"
                  value={formData.customer_base}
                  onChange={(e) => handleInputChange("customer_base", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Customer Acquisition Cost (CAC) - RWF"
                  value={formData.cac}
                  onChange={(e) => handleInputChange("cac", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Customer Lifetime Value (LTV) - RWF"
                  value={formData.ltv}
                  onChange={(e) => handleInputChange("ltv", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Monthly Customer Growth Rate %"
                  value={formData.monthly_growth}
                  onChange={(e) => handleInputChange("monthly_growth", e.target.value)}
                  max="100"
                />
              </div>

              <Textarea
                placeholder="Main Competitors & Your Market Share Estimate&#10;Company 1 (%)&#10;Company 2 (%)"
                value={formData.competitors}
                onChange={(e) => handleInputChange("competitors", e.target.value)}
                rows={4}
              />

              <Textarea
                placeholder="Key Partnerships"
                value={formData.partnerships}
                onChange={(e) => handleInputChange("partnerships", e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 6: Funding & Team */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle>Funding Request & Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Amount of funding sought - RWF *"
                  value={formData.funding_amount}
                  onChange={(e) => handleInputChange("funding_amount", e.target.value)}
                  required
                />
                <Select value={formData.funding_type} onValueChange={(v) => handleInputChange("funding_type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type of funding" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNDING_TYPES.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.funding_type === "equity" && (
                <Input
                  type="number"
                  placeholder="Valuation - RWF"
                  value={formData.valuation}
                  onChange={(e) => handleInputChange("valuation", e.target.value)}
                />
              )}

              <div>
                <Label className="mb-3 block">Use of Funds - Detailed Breakdown (RWF)</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Marketing & Sales"
                    value={formData.marketing_sales}
                    onChange={(e) => handleInputChange("marketing_sales", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Product Development"
                    value={formData.product_dev}
                    onChange={(e) => handleInputChange("product_dev", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Team Expansion"
                    value={formData.team_expansion}
                    onChange={(e) => handleInputChange("team_expansion", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Operations"
                    value={formData.operations}
                    onChange={(e) => handleInputChange("operations", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Debt Repayment"
                    value={formData.debt_repayment}
                    onChange={(e) => handleInputChange("debt_repayment", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Other"
                    value={formData.other_allocation}
                    onChange={(e) => handleInputChange("other_allocation", e.target.value)}
                  />
                </div>
              </div>

              <Textarea
                placeholder="Expected Milestones with this funding"
                value={formData.expected_milestones}
                onChange={(e) => handleInputChange("expected_milestones", e.target.value)}
                rows={3}
              />

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Team Details</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>

                <div className="space-y-4">
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => handleTeamMemberChange(idx, "name", e.target.value)}
                        />
                        <Input
                          placeholder="Position"
                          value={member.position}
                          onChange={(e) => handleTeamMemberChange(idx, "position", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Ownership %"
                          value={member.ownership}
                          onChange={(e) => handleTeamMemberChange(idx, "ownership", e.target.value)}
                          max="100"
                        />
                        <Input
                          type="number"
                          placeholder="Salary - RWF"
                          value={member.salary}
                          onChange={(e) => handleTeamMemberChange(idx, "salary", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Years with Company"
                          value={member.years}
                          onChange={(e) => handleTeamMemberChange(idx, "years", e.target.value)}
                        />
                        {teamMembers.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTeamMember(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 7: Terms */}
        {step === 7 && (
          <Card>
            <CardHeader>
              <CardTitle>Service & Legal Agreement</CardTitle>
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
                    I agree to pay service fees required for delivery and the success fee obligation *
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreed_to_confidentiality"
                    checked={formData.agreed_to_confidentiality}
                    onCheckedChange={(checked) => handleInputChange("agreed_to_confidentiality", checked)}
                  />
                  <label htmlFor="agreed_to_confidentiality" className="text-sm cursor-pointer">
                    I agree to maintain confidentiality *
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
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
            <Button type="submit" disabled={isLoading || !formData.agreed_to_terms || !formData.agreed_to_fees}>
              {isLoading ? "Submitting..." : "Submit Form"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
