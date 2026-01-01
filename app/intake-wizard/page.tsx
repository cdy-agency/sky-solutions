import type { Metadata } from "next"
import IntakeWizardClient from "./intake-wizard-client"

export const metadata: Metadata = {
  title: "Complete Your Profile | SKY Solutions",
  description: "Tell us more about yourself to get started with SKY Solutions",
  robots: {
    index: false,
  },
}

export default function IntakeWizardPage() {
  return <IntakeWizardClient />
}
