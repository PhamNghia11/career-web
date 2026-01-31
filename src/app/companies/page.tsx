import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
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
        <div className="relative py-20 overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
            style={{ backgroundImage: `url('${banner?.image || '/hero-bg.png'}')` }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-primary/85" />

          {/* Content */}
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-3xl lg:text-5xl font-bold mb-3 text-white tracking-tight">
              {banner?.title || "Khám phá doanh nghiệp"}
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {banner?.subtitle || "Tìm hiểu về các doanh nghiệp hàng đầu và cơ hội nghề nghiệp dành cho bạn"}
            </p>
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
