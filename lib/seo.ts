export const generateSEOMetadata = (title: string, description: string, path: string, ogImage?: string) => {
  const baseUrl = "https://skysolutions.com" // Update with your domain
  const url = `${baseUrl}${path}`

  return {
    title: `${title} | SKY Solutions`,
    description,
    keywords: [
      "business funding",
      "investment opportunity",
      "entrepreneur funding",
      "startup investment",
      "business capital",
    ],
    openGraph: {
      title: `${title} | SKY Solutions`,
      description,
      url,
      type: "website",
      images: [
        {
          url: ogImage || `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | SKY Solutions`,
      description,
      images: [ogImage || `${baseUrl}/og-image.png`],
    },
    canonical: url,
  }
}

export const generateBusinessSchema = (business: any, baseUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.title,
    description: business.description,
    image: business.image_url,
    category: business.category,
    areaServed: business.entrepreneur_id?.location,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: business.entrepreneur_id?.email,
      telephone: business.entrepreneur_id?.phone,
    },
    url: `${baseUrl}/investor/browse/${business._id}`,
  }
}
