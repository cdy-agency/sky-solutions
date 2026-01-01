"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProfileForm } from "@/components/profile-form"
import { DocumentSubmissionForm } from "@/components/document-submission-form"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and documents</p>
        </div>

        <div className="space-y-6">
          <ProfileForm />

          <Separator />

          <DocumentSubmissionForm />
        </div>
      </div>
    </DashboardLayout>
  )
}
