import BrowseBusinessesPageClient from "./client"

export const metadata = {
  title: "Browse Investment Opportunities | SKY Solutions",
  description:
    "Discover promising business opportunities ready for investment. Filter by category and find your next investment.",
  keywords: [
    "investment opportunities",
    "browse businesses",
    "funding opportunities",
    "startup investment",
    "business investment",
  ],
  openGraph: {
    title: "Browse Investment Opportunities | SKY Solutions",
    description: "Discover promising business opportunities ready for investment.",
    type: "website",
    url: "https://skysolutions.com/investor/browse",
  },
  alternates: {
    canonical: "https://skysolutions.com/investor/browse",
  },
}

export default function BrowseBusinessesPage() {
  return <BrowseBusinessesPageClient />
}
