import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SocialChatWidget } from "@/components/chat/social-chat-widget"
import { JobsListClient } from "@/components/jobs/jobs-list-client"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { Job } from "@/lib/jobs-data"

async function getActiveJobsFromDB(): Promise<Job[]> {
  try {
    const collection = await getCollection(COLLECTIONS.JOBS)
    const jobs = await collection.find({ status: "active" }).sort({ postedAt: -1 }).toArray()

    return jobs.map(job => ({
      ...job,
      _id: job._id.toString(),
      skills: job.skills || []
    })) as Job[]
  } catch (error) {
    console.error("Error fetching jobs from MongoDB:", error)
    return []
  }
}

export default async function JobsPage() {
  const dbJobs = await getActiveJobsFromDB()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/50 via-background to-muted/30">
      <Header />
      <main className="flex-1">
        <div className="relative py-20 overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero-bg.png')" }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-[#1e3a5f]/85" />

          {/* Content */}
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white tracking-tight">
              Tìm kiếm cơ hội nghề nghiệp
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Khám phá hàng ngàn việc làm hấp dẫn từ các doanh nghiệp hàng đầu dành cho sinh viên GDU
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<div className="text-center py-20">Đang tải danh sách việc làm...</div>}>
            <JobsListClient dbJobs={dbJobs} />
          </Suspense>
        </div>
      </main>
      <Footer />
      <SocialChatWidget />
    </div>
  )
}
