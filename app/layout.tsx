import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SKY Solutions - Connect Entrepreneurs & Investors",
  description:
    "Platform connecting entrepreneurs with investors to fund and grow businesses. Submit your business plan, get approval, and attract investment.",
  keywords: [
    "business funding",
    "investment platform",
    "entrepreneur funding",
    "startup investment",
    "business capital",
    "investor network",
  ],
  metadataBase: new URL("https://skysolutions.com"),
  openGraph: {
    title: "SKY Solutions - Connect Entrepreneurs & Investors",
    description: "Platform connecting entrepreneurs with investors to fund and grow businesses.",
    url: "https://skysolutions.com",
    siteName: "SKY Solutions",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SKY Solutions - Business Funding Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SKY Solutions - Connect Entrepreneurs & Investors",
    description: "Platform connecting entrepreneurs with investors to fund and grow businesses.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://skysolutions.com",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SKY Solutions",
              description: "Platform connecting entrepreneurs with investors to fund and grow businesses",
              url: "https://skysolutions.com",
              logo: "https://skysolutions.com/logo.png",
              sameAs: ["https://twitter.com/skysolutions", "https://linkedin.com/company/skysolutions"],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Service",
                email: "support@skysolutions.com",
              },
            }),
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
