import { NextResponse } from "next/server"
import jobsData from "@/data/jobs.json"

// Get jobs from imported data - works on Vercel
function getJobs() {
  const data = jobsData as any
  // Support both old array format and new object format
  return Array.isArray(data) ? data : data.jobs || []
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const field = searchParams.get("field")
    const search = searchParams.get("search")?.toLowerCase()

    let jobs = getJobs()

    // Filter by type (internship, full-time, part-time)
    if (type && type !== "all") {
      jobs = jobs.filter((j: any) => j.type === type)
    }

    // Filter by status
    if (status && status !== "all") {
      jobs = jobs.filter((j: any) => j.status === status)
    }

    // Filter by field
    if (field && field !== "all") {
      jobs = jobs.filter((j: any) => j.field === field)
    }

    // Search by title, company, or description
    if (search) {
      jobs = jobs.filter(
        (j: any) =>
          j.title.toLowerCase().includes(search) ||
          j.company.toLowerCase().includes(search) ||
          j.description.toLowerCase().includes(search) ||
          j.skills.some((s: string) => s.toLowerCase().includes(search))
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        total: jobs.length,
      },
    })
  } catch (error) {
    console.error("Error reading jobs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const newJob = {
      id: String(Date.now()),
      ...body,
      createdAt: new Date().toISOString(),
      status: "active",
      applicants: 0,
    }

    return NextResponse.json({
      success: true,
      message: "Job posted successfully",
      data: newJob,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to post job" },
      { status: 500 }
    )
  }
}
