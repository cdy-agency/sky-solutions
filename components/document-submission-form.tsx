"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"
import { Loader2, Upload, X, FileText } from "lucide-react"

const DOCUMENT_TYPES = [
  { value: "national_id", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "passport_image", label: "Passport Image" },
  { value: "business_license", label: "Business License" },
  { value: "tax_certificate", label: "Tax Certificate" },
]

export function DocumentSubmissionForm() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [document, setDocument] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Error",
          description: `File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          variant: "destructive",
        })
        return
      }

      setDocument(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !document || !documentType) {
      toast({
        title: "Error",
        description: "Please select document type and file",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("document", document)
      formData.append("document_type", documentType)

      await apiClient("/auth/submit-documents", {
        method: "POST",
        body: formData,
        token,
        isFormData: true,
      })

      toast({
        title: "Success",
        description: "Document submitted successfully",
      })
      setDocument(null)
      setDocumentType("")
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Submit Documents
        </CardTitle>
        <CardDescription>Upload your identification documents for verification</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Upload Document *</Label>
            <p className="text-sm text-muted-foreground">Maximum file size: 5MB (Images or PDFs)</p>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {document ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{document.name}</p>
                      <p className="text-xs text-muted-foreground">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setDocument(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-foreground">Click to upload document</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, or PDF files</span>
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !document || !documentType} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Document
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
