import type { Metadata } from "next"
import LoginPageClient from "./login-client"

export const metadata: Metadata = {
  title: "Sign In | SKY Solutions",
  description: "Sign in to your SKY Solutions account to access your dashboard and opportunities.",
  robots: {
    index: false,
  },
}

export default function LoginPage() {
  return <LoginPageClient />
}
