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
import { ArrowLeft, DollarSign, FileText, ExternalLink, MapPin, Mail, Phone, User, Loader2 } from "lucide-react"

interface Business {
  _id: string
  title: string
  category: string
  description: string
  needed_funds: number
  image_url?: string
  funded_amount: number
  pdf_url?: string
  entrepreneur_id: {
    name: string
    email: string
    phone: string
    location: string
  }
  created_at: string
}

export default function BusinessDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [investAmount, setInvestAmount] = useState("")
  const [isInvesting, setIsInvesting] = useState(false)
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

  const handleInvest = async () => {
    if (!token || !id || !investAmount) return

    setIsInvesting(true)
    try {
      await investorApi.invest(id as string, Number.parseFloat(investAmount), token)
      toast({
        title: "Investment Request Sent",
        description: "Your investment request has been submitted for review.",
      })
      setDialogOpen(false)
      setInvestAmount("")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsInvesting(false)
    }
  }

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
            {/* <Card>
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
            </Card> */}
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
                  <p className="font-medium text-foreground">{business.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Funding Required</p>
                  <p className="text-2xl font-bold text-foreground flex items-center">
                    <DollarSign className="h-6 w-6" />
                    {(business.needed_funds - business.funded_amount).toLocaleString()}
                  </p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Invest Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Make an Investment</DialogTitle>
                      <DialogDescription>Enter the amount you'd like to invest in "{business.title}"</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Investment Amount ($)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="10000"
                          value={investAmount}
                          onChange={(e) => setInvestAmount(e.target.value)}
                          min={1}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your investment request will be reviewed by the platform administrators.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInvest} disabled={isInvesting || !investAmount}>
                        {isInvesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Investment
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
