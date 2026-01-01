"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { investorApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileText, ExternalLink, MapPin, Mail, Phone, User, Loader2 } from "lucide-react"

interface Business {
  _id: string
  title: string
  category_id?: { _id: string; name: string } | string
  description?: string
  needed_funds?: number
  total_shares?: number
  remaining_shares?: number
  share_value?: number
  minimum_shares_per_request?: number
  image_url?: string
  pdf_url?: string
  entrepreneur_id?: {
    name: string
    email: string
    phone: string
    location: string
  }
  created_at?: string
}

export default function BusinessDetailPageClient() {
  const { id } = useParams()
  const { token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requestedShares, setRequestedShares] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!token || !id) return
      try {
        const data = await investorApi.getBusiness(id as string, token)
        setBusiness(data)
      } catch (error) {
        console.error("Failed to fetch business:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBusiness()
  }, [token, id])

  const handleRequestShares = async () => {
    if (!token || !id || !requestedShares || !business) return

    const shares = Number.parseInt(requestedShares)
    const minShares = business.minimum_shares_per_request || 1

    if (shares < minShares) {
      toast({
        title: "Error",
        description: `Minimum shares required: ${minShares}`,
        variant: "destructive",
      })
      return
    }

    if (shares > (business.remaining_shares || 0)) {
      toast({
        title: "Error",
        description: `Only ${business.remaining_shares} shares available`,
        variant: "destructive",
      })
      return
    }

    setIsRequesting(true)
    try {
      await investorApi.requestShares(id as string, { requested_shares: shares }, token)
      toast({
        title: "Share Request Sent",
        description: "Your share request has been submitted for review.",
      })
      setDialogOpen(false)
      setRequestedShares("")
      // Refresh business data to update remaining shares
      const data = await investorApi.getBusiness(id as string, token)
      setBusiness(data)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsRequesting(false)
    }
  }

  const calculatedAmount = business && requestedShares && business.share_value
    ? Number.parseInt(requestedShares || "0") * business.share_value
    : 0

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-32 animate-pulse bg-muted rounded" />
          <div className="h-64 animate-pulse bg-muted rounded" />
        </div>
      </DashboardLayout>
    )
  }

  if (!business) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Business not found</p>
            <Link href="/investor/browse">
              <Button className="mt-4">Back to Browse</Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{business.title}</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {business.image_url && (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={business.image_url || "/placeholder.svg"}
                    alt={business.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Business</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{business.description}</p>
              </CardContent>
            </Card>

            {/* Entrepreneur Info */}
            <Card>
              <CardHeader>
                <CardTitle>Entrepreneur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">{business.entrepreneur_id?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">{business.entrepreneur_id?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">{business.entrepreneur_id?.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">{business.entrepreneur_id?.location}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Investment Card */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium text-foreground">
                    {typeof business.category_id === "object" && business.category_id
                      ? business.category_id.name
                      : business.category_id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Shares</p>
                  <p className="text-2xl font-bold text-foreground">
                    {business.remaining_shares || 0} shares
                  </p>
                  {business.share_value && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ${business.share_value.toLocaleString()} per share
                    </p>
                  )}
                </div>
                {business.minimum_shares_per_request && (
                  <div className="bg-muted/50 p-3 rounded-lg border border-border">
                    <p className="text-sm font-medium text-foreground">Minimum Purchase</p>
                    <p className="text-lg font-semibold text-[#1B4F91]">
                      {business.minimum_shares_per_request} shares
                    </p>
                    {business.share_value && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ${(business.minimum_shares_per_request * business.share_value).toLocaleString()} minimum
                      </p>
                    )}
                  </div>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg" disabled={!business.remaining_shares || business.remaining_shares === 0}>
                      Request Shares
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Shares</DialogTitle>
                      <DialogDescription>
                        Enter the number of shares you'd like to purchase in "{business.title}"
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="shares">Number of Shares</Label>
                        <Input
                          id="shares"
                          type="number"
                          placeholder={`Min: ${business.minimum_shares_per_request || 1}`}
                          value={requestedShares}
                          onChange={(e) => setRequestedShares(e.target.value)}
                          min={business.minimum_shares_per_request || 1}
                          max={business.remaining_shares || 0}
                        />
                        {business.minimum_shares_per_request && (
                          <p className="text-xs text-muted-foreground">
                            Minimum: {business.minimum_shares_per_request} shares
                          </p>
                        )}
                        {business.remaining_shares && (
                          <p className="text-xs text-muted-foreground">
                            Available: {business.remaining_shares} shares
                          </p>
                        )}
                      </div>
                      {requestedShares && business.share_value && (
                        <div className="bg-muted/50 p-4 rounded-lg border border-border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Shares:</span>
                            <span className="font-medium text-foreground">{requestedShares}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Price per share:</span>
                            <span className="font-medium text-foreground">
                              ${business.share_value.toLocaleString()}
                            </span>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-foreground">Total Amount:</span>
                              <span className="text-lg font-bold text-[#1B4F91]">
                                ${calculatedAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Your share request will be reviewed by the platform administrators.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRequestShares}
                        disabled={
                          isRequesting ||
                          !requestedShares ||
                          Number.parseInt(requestedShares) < (business.minimum_shares_per_request || 1) ||
                          Number.parseInt(requestedShares) > (business.remaining_shares || 0)
                        }
                      >
                        {isRequesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {business.pdf_url && (
                  <a href={business.pdf_url} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      View Business Plan
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

