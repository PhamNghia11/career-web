"use client"

import { useState, useEffect } from "react"
import { MapPin, Clock, DollarSign, Building, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ApplyJobDialog } from "@/components/jobs/apply-job-dialog"
import { getFeaturedJobs, Job } from "@/lib/jobs-data"

const typeColors = {
  "full-time": "bg-green-500/20 text-green-700 border border-green-500/30",
  "part-time": "bg-blue-500/20 text-blue-700 border border-blue-500/30",
  internship: "bg-orange-500/20 text-orange-700 border border-orange-500/30",
  freelance: "bg-purple-500/20 text-purple-700 border border-purple-500/30",
}

const typeLabels = {
  "full-time": "Toàn thời gian",
  "part-time": "Bán thời gian",
  internship: "Thực tập",
  freelance: "Freelance",
}

export function FeaturedJobs() {
  const [selectedJob, setSelectedJob] = useState<{ title: string; company: string; jobId: string; creatorId?: string } | null>(null)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>(getFeaturedJobs(4))
  const [loading, setLoading] = useState(true)

  // Fetch jobs from MongoDB and merge with static JSON
  useEffect(() => {
    const fetchDbJobs = async () => {
      try {
        const response = await fetch("/api/jobs?status=active")
        const data = await response.json()

        if (data.success && data.data?.jobs) {
          const dbJobs: Job[] = data.data.jobs
          const staticJobs = getFeaturedJobs(10)

          // Merge: DB jobs first (priority), then static jobs that aren't duplicates
          const dbJobIds = new Set(dbJobs.map(job => job._id))
          const uniqueStaticJobs = staticJobs.filter(job => !dbJobIds.has(job._id))
          const allJobs = [...dbJobs, ...uniqueStaticJobs]

          // Sort by postedAt and take first 4
          const sorted = allJobs
            .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
            .slice(0, 4)

          setFeaturedJobs(sorted)
        }
      } catch (error) {
        console.error("Error fetching featured jobs:", error)
        // Keep using static data on error
      } finally {
        setLoading(false)
      }
    }

    fetchDbJobs()
  }, [])

  const handleApply = (jobId: string, jobTitle: string, company: string, creatorId?: string) => {
    setSelectedJob({ title: jobTitle, company: company, jobId: jobId, creatorId: creatorId })
    setIsApplyDialogOpen(true)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-accent/30 via-muted/40 to-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Việc làm nổi bật</h2>
            <p className="text-muted-foreground mt-2">Cơ hội việc làm hấp dẫn dành cho sinh viên GDU</p>
          </div>
          <Link href="/jobs">
            <Button variant="outline" className="hidden md:flex items-center gap-2 bg-card hover:bg-accent">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredJobs.map((job) => (
            <Card key={job._id} className="hover:shadow-xl transition-all bg-card/80 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-white border flex items-center justify-center p-2 flex-shrink-0">
                    <img
                      src={job.logo || "/placeholder.svg"}
                      alt={job.company}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge className={typeColors[job.type as keyof typeof typeColors]}>
                      {typeLabels[job.type as keyof typeof typeLabels]}
                    </Badge>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">{job.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span className="truncate">{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-foreground">{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-secondary" />
                    <span>Hạn: {job.deadline}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleApply(job._id, job.title, job.company, job.creatorId)}
                >
                  Ứng tuyển ngay
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/jobs">
            <Button variant="outline" className="items-center gap-2 bg-card hover:bg-accent">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <ApplyJobDialog
        isOpen={isApplyDialogOpen}
        onClose={() => setIsApplyDialogOpen(false)}
        jobTitle={selectedJob?.title || ""}
        companyName={selectedJob?.company || ""}
        jobId={selectedJob?.jobId}
        employerId={selectedJob?.creatorId}
      />
    </section>
  )
}
