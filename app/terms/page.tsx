"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/sections/navbar"
import Footer from "@/components/sections/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { publicApi } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface Terms {
  _id: string
  general: string
  entrepreneur: string
  investor: string
}

export default function TermsPage() {
  const [terms, setTerms] = useState<Terms | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await publicApi.getTerms()
        setTerms(data)
      } catch (error) {
        console.error("Failed to fetch terms:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTerms()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms & Conditions</h1>
          <p className="text-muted-foreground">Please read our terms and conditions carefully</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Terms & Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="entrepreneur">Entrepreneur</TabsTrigger>
                <TabsTrigger value="investor">Investor</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6">
                <div className="prose prose-slate max-w-none dark:prose-invert">
                  {terms?.general ? (
                    <div dangerouslySetInnerHTML={{ __html: terms.general }} />
                  ) : (
                    <p className="text-muted-foreground">No general terms available at this time.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="entrepreneur" className="mt-6">
                <div className="prose prose-slate max-w-none dark:prose-invert">
                  {terms?.entrepreneur ? (
                    <div dangerouslySetInnerHTML={{ __html: terms.entrepreneur }} />
                  ) : (
                    <p className="text-muted-foreground">No entrepreneur terms available at this time.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="investor" className="mt-6">
                <div className="prose prose-slate max-w-none dark:prose-invert">
                  {terms?.investor ? (
                    <div dangerouslySetInnerHTML={{ __html: terms.investor }} />
                  ) : (
                    <p className="text-muted-foreground">No investor terms available at this time.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

