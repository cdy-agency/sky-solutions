import { Suspense } from "react"
import NewBusinessFormClient from "./new-business-form-client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

function LoadingFallback() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading form...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function NewBusinessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewBusinessFormClient />
    </Suspense>
  )
}
