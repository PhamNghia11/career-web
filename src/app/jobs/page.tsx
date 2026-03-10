import { Suspense } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { JobsListClient } from "@/components/jobs/jobs-list-client"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { getStartOfToday } from "@/lib/date-utils"

import { Job } from "@/lib/jobs-data"

// ISR: Cache page for 60 seconds, then revalidate in background
export const revalidate = 60

async function getBannerData(): Promise<any> {
  try {
    const collection = await getCollection(COLLECTIONS.HERO_SLIDES)
    const slide = await collection.findOne(
      { page: "jobs", isActive: true },
      { projection: { title: 1, subtitle: 1, image: 1 } }
    )

    if (slide) {
      return {
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching jobs banner:", error)
    return null
  }
}

async function getInitialJobs() {
  try {
    const collection = await getCollection(COLLECTIONS.JOBS)
    const startOfToday = getStartOfToday()

    const filterQuery = {
      status: "active",
      $or: [
        { normalizedDeadline: { $gte: startOfToday } },
        { deadline: { $in: [null, "", "Vô thời hạn"] } }
      ]
    }

    const [jobs, total] = await Promise.all([
      collection.aggregate([
        { $match: filterQuery },
        { $sort: { postedAt: -1 } },
        { $limit: 15 },
        { $lookup: { from: "companies", localField: "companyId", foreignField: "_id", as: "companyInfo" } },
        { $addFields: { companyData: { $arrayElemAt: ["$companyInfo", 0] } } },
        { $project: { companyInfo: 0 } }
      ]).toArray(),
      collection.countDocuments(filterQuery)
    ])

    // Serialize ObjectIds to strings
    const serialized = jobs.map(job => ({
      ...job,
      _id: job._id.toString(),
      companyId: job.companyId?.toString?.() || job.companyId,
      creatorId: job.creatorId?.toString?.() || job.creatorId,
      companyData: job.companyData ? { ...job.companyData, _id: job.companyData._id?.toString?.() } : undefined,
    }))

    return { jobs: serialized, total }
  } catch (error) {
    console.error("Error fetching initial jobs:", error)
    return { jobs: [], total: 0 }
  }
}

export default async function JobsPage() {
  const [banner, initialData] = await Promise.all([
    getBannerData(),
    getInitialJobs()
  ])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/50 via-background to-muted/30">
      <Header />
      <main className="flex-1">
        <div className="relative min-h-[85vh] overflow-hidden flex flex-col justify-end pb-16 lg:pb-24">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
            style={{ backgroundImage: `url('${banner?.image || '/vercel-banner.jpg'}')` }}
          />
          {/* Light Overlay for clarity */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Content - Bottom Left */}
          <div className="w-full px-4 md:px-10 lg:px-20 relative z-10">
            <div className="max-w-5xl">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 text-white tracking-tight drop-shadow-lg leading-tight">
                {banner?.title || "Tìm kiếm cơ hội nghề nghiệp"}
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-white mb-6 drop-shadow-md font-medium max-w-3xl">
                {banner?.subtitle || "Khám phá hàng ngàn việc làm hấp dẫn từ các doanh nghiệp hàng đầu dành cho sinh viên GDU"}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full px-4 md:px-10 lg:px-20 py-12">
          <Suspense fallback={<div className="text-center py-20">Đang tải danh sách việc làm...</div>}>
            <JobsListClient initialJobs={initialData.jobs as any} initialTotal={initialData.total} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
