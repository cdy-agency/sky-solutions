import Navbar from "@/components/sections/navbar"
import TrustStats from "@/components/sections/trustSection/trust-stats"
import ExploreStartups from "@/components/sections/explore-startups"
import CoInvest from "@/components/sections/co-invest"
import BrowseCategory from "@/components/sections/browse-category"
import WhyInvest from "@/components/sections/why-invest"
import HowItWorks from "@/components/sections/how-it-works"
import InvestmentContracts from "@/components/sections/investment-contracts"
import FAQ from "@/components/sections/faq"
import CTA from "@/components/sections/cta"
import Testimonials from "@/components/sections/testimonials"
import Footer from "@/components/sections/footer"
import Hero from "@/components/sections/hero"
import TrustSection from "@/components/sections/trustSection/trustSection"

export const metadata = {
  title: "SKYSOLUTION - Invest in Entrepreneurs Building the Future",
  description: "Angel invest in promising startups with VCs and professional investors on SKYSOLUTION",
}

export default function Home() {
  return (
    <main className="overflow-hidden bg-white">
      <Navbar />
      <Hero />
      <TrustSection />
      <ExploreStartups />
      <CoInvest />
      {/* <BrowseCategory /> */}
      <WhyInvest />
      <HowItWorks />
      <InvestmentContracts />
      <FAQ />
      {/* <CTA /> */}
      <Testimonials />
      <Footer />
    </main>
  )
}
