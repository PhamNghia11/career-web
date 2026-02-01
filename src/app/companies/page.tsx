import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { CompaniesListClient } from "@/components/companies/companies-list-client"

async function getBannerData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/hero-slides?page=companies`, { next: { revalidate: 60 } })
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
        <div className="relative min-h-[85vh] overflow-hidden flex flex-col justify-start pt-56 lg:pt-80">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
            style={{ backgroundImage: `url('${banner?.image || '/hero-bg.png'}')` }}
          />
          {/* Light Overlay for clarity */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Content */}
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-white tracking-tight drop-shadow-lg">
                {banner?.title || "Khám phá doanh nghiệp"}
              </h1>
              <p className="text-lg md:text-xl text-white mb-2 drop-shadow-md font-medium">
                {banner?.subtitle || "Tìm hiểu về các doanh nghiệp hàng đầu và cơ hội nghề nghiệp dành cho bạn"}
              </p>
              {banner?.cta && (
                <Link
                  href={banner.link || "/companies"}
                  className="inline-flex items-center justify-center bg-[#0077B6] hover:bg-[#0077B6]/90 text-white font-bold text-lg px-10 h-[60px] rounded-xl shadow-xl transition-all hover:scale-105 min-w-[240px] w-fit"
                >
                  {banner.cta}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <CompaniesListClient />
        </div>
      </main>
      <Footer />
    </div>
  )
}
