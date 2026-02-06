import { Suspense } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { JobsListClient } from "@/components/jobs/jobs-list-client"
import { getCollection, COLLECTIONS } from "@/database/connection"

export const dynamic = "force-dynamic"
import { Job } from "@/lib/jobs-data"

import { unstable_cache } from "next/cache"
import { getStartOfToday, parseNormalizedDeadline } from "@/lib/date-utils"

// Cache for 60 seconds (short duration as this page is dynamic based on user filters often, 
// but for initial load of "all" it helps).
// Note: We might want to move this logic to data-service if reused.
const getActiveJobsFromDB = unstable_cache(
  async () => {
    try {
      const startOfToday = getStartOfToday()
      const collection = await getCollection(COLLECTIONS.JOBS)

      // Filter by active status AND deadline >= today
      // Using normalizedDeadline directly
      const jobs = await collection.aggregate([
        {
          $match: {
            status: "active",
            $or: [
              { normalizedDeadline: { $gte: startOfToday } },
              { deadline: { $in: [null, "", "Vô thời hạn"] } },
              { normalizedDeadline: { $exists: false } }
            ]
          }
        },
        // ... (lookup and other stages remain same)
        {
          $lookup: {
            from: COLLECTIONS.APPLICATIONS,
            let: { jobIdStr: { $toString: "$_id" }, jobIdObj: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $or: [
                          { $eq: ["$jobId", "$$jobIdStr"] },
                          { $eq: ["$jobId", "$$jobIdObj"] }
                        ]
                      },
                      { $eq: ["$status", "hired"] }
                    ]
                  }
                }
              }
            ],
            as: "hiredApplications"
          }
        },
        {
          $addFields: {
            hiredCount: { $size: "$hiredApplications" }
          }
        },
        {
          $match: {
            $expr: {
              $or: [
                { $eq: ["$quantity", -1] }, // Limitless
                { $lt: ["$hiredCount", { $ifNull: ["$quantity", 1] }] } // Still has slots
              ]
            }
          }
        },
        {
          $project: {
            hiredApplications: 0,
            // Optimization: Exclude heavy fields for list view
            description: 0,
            requirements: 0,
            benefits: 0,
            detailedBenefits: 0
          }
        },
        {
          $sort: { postedAt: -1 }
        }
      ]).toArray()

      // Post-query filtering (Safety net for unmigrated data)
      // Some jobs might match { normalizedDeadline: { $exists: false } } but actually be expired
      const validJobs = jobs.filter(job => {
        // If normalizedDeadline exists, it was already checked by DB query
        if (job.normalizedDeadline) return true

        // If deadline is explicitly indefinite, keep it
        if (!job.deadline || job.deadline === "Vô thời hạn") return true

        // For jobs without normalizedDeadline, parse and check manually
        const deadlineDate = parseNormalizedDeadline(job.deadline)
        if (!deadlineDate) return true // Keep if can't parse (safety)

        return deadlineDate >= startOfToday
      })

      return validJobs.map(job => ({
        ...job,
        _id: job._id.toString(),
        skills: job.skills || [],
        hiredCount: job.hiredCount || 0
      })) as any[]
    } catch (error) {
      console.error("Error fetching jobs from MongoDB:", error)
      return []
    }
  },
  ['active-jobs-list'],
  { revalidate: 60, tags: ['jobs'] }
)

// ISR: Cache page for 60 seconds, then revalidate in background
export const revalidate = 60

async function getBannerData(): Promise<any> {
  try {
    const collection = await getCollection(COLLECTIONS.HERO_SLIDES)
    const slide = await collection.findOne({ page: "jobs", isActive: true })

    if (slide) {
      return {
        ...slide,
        _id: slide._id.toString()
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching jobs banner:", error)
    return null
  }
}

export default async function JobsPage() {
  const [dbJobs, banner] = await Promise.all([
    getActiveJobsFromDB(),
    getBannerData()
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
            <JobsListClient dbJobs={dbJobs} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
