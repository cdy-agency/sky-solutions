import type { Metadata } from "next"
import BusinessDetailPageClient from "./client"

interface Business {
  _id: string
  title: string
  category: string
  description: string
  needed_funds: number
  image_url?: string
  pdf_url?: string
  entrepreneur_id: {
    name: string
    email: string
    phone: string
    location: string
  }
  created_at: string
}

export default async function BusinessDetailPage() {
  return <BusinessDetailPageClient />
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const business: Business = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/businesses/public/${params.id}`,
    ).then((res) => res.json())

    return {
      title: `${business.title} - Investment Opportunity | SKY Solutions`,
      description: business.description?.substring(0, 160),
      keywords: [business.category, "investment opportunity", "business funding", "startup", business.title],
      openGraph: {
        title: `${business.title} | SKY Solutions`,
        description: business.description?.substring(0, 160),
        images: [
          {
            url: business.image_url,
            width: 1200,
            height: 630,
            alt: business.title,
          },
        ],
        url: `https://skysolutions.com/investor/browse/${params.id}`,
      },
      alternates: {
        canonical: `https://skysolutions.com/investor/browse/${params.id}`,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Investment Opportunity | SKY Solutions",
      description: "View this investment opportunity on SKY Solutions",
    }
  }
}
