import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedJobs } from "@/components/home/featured-jobs"
import { MajorsSection } from "@/components/home/majors-section"
import { StatsSection } from "@/components/home/stats-section"
import { PartnersSection } from "@/components/home/partners-section"
import { MarketTrends } from "@/components/home/market-trends"
import { getHeroSlides, getLatestJobs, getSiteConfig } from "@/lib/data-service"
import { getCollection, COLLECTIONS } from "@/database/connection"

export const revalidate = 3600 // Revalidate home page every 1 hour

export default async function HomePage() {
  const [slides, jobs, featuredJobsConfig, quickSearchConfig, majorsConfig] = await Promise.all([
    getHeroSlides("home"),
    getLatestJobs(4),
    getSiteConfig("home_featured_jobs"),
    getSiteConfig("home_quick_search"),
    getSiteConfig("home_majors")
  ])

  // Fetch News and Partners directly in server
  const newsCollection = await getCollection(COLLECTIONS.NEWS)
  const rawNews = await newsCollection.find({}).sort({ publishedAt: -1 }).limit(3).toArray()
  const newsItems = rawNews.map(item => ({ ...item, _id: item._id.toString() }))

  const companiesCollection = await getCollection(COLLECTIONS.COMPANIES)
  const rawPartners = await companiesCollection.aggregate([
    { $sample: { size: 15 } },
    { $project: { name: 1, logo: 1 } }
  ]).toArray()
  const partnersItems = rawPartners.map(p => ({ ...p, _id: p._id.toString() }))

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/50 via-background to-muted/30">
      <Header />
      <main className="flex-1">
        <HeroSection initialSlides={slides as any} />
        <div className="mt-12">
          <FeaturedJobs initialJobs={jobs as any} initialConfig={featuredJobsConfig as any} />
        </div>
        <MarketTrends initialNews={newsItems as any} initialConfig={quickSearchConfig as any} />
        <MajorsSection initialConfig={majorsConfig as any} />
        <StatsSection />
        <PartnersSection initialPartners={partnersItems as any} />
      </main>
      <Footer />
    </div>
  )
}
