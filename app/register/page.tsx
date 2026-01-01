import type { Metadata } from "next"
import RegisterPageClient from "./register-client"

export const metadata: Metadata = {
  title: "Create Account | SKY Solutions",
  description: "Join SKY Solutions as an entrepreneur or investor. Create your account and start your journey today.",
  robots: {
    index: false,
  },
}

export default function RegisterPage() {
  return <RegisterPageClient />
}
