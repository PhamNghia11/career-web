import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { CompaniesListClient } from "@/components/companies/companies-list-client"

export const dynamic = "force-dynamic"

async function getBannerData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/hero-slides?page=companies`, { cache: 'no-store' })
    const data = await res.json()
    if (data.success && data.data.length > 0) {
      return data.data[0]
    }
    return null
  } catch (error) {
    console.error("Error fetching companies banner:", error)
    return null
  }
}

export default async function CompaniesPage() {
  const banner = await getBannerData()
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/30 to-background">
      <Header />
      <main className="flex-1">
        <div className="relative min-h-[85vh] overflow-hidden flex flex-col justify-end pb-16 lg:pb-24">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
            style={{ backgroundImage: `url('${banner?.image || '/companies-banner.jpg'}')` }}
          />
          {/* Light Overlay for clarity */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Content - Bottom Left */}
          <div className="px-4 md:px-12 lg:px-24 relative z-10">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 text-white tracking-tight drop-shadow-lg leading-tight">
                {banner?.title || "Khám phá doanh nghiệp"}
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-white mb-6 drop-shadow-md font-medium max-w-2xl">
                {banner?.subtitle || "Tìm hiểu về các doanh nghiệp hàng đầu và cơ hội nghề nghiệp dành cho bạn"}
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto px-4 md:px-12 lg:px-24 py-12">
          <CompaniesListClient />
        </div>
      </main>
      <Footer />
    </div>
  )
}
