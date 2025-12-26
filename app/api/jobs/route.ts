import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const field = searchParams.get("field")
    const search = searchParams.get("search")?.toLowerCase()
    const creatorId = searchParams.get("creatorId")

    // Default to active jobs if no status specified (for public view)
    // Admin page will likely request status=all or specific status

    const collection = await getCollection(COLLECTIONS.JOBS)

    let query: any = {}

    // Refined logic:
    // If creatorId is provided, we fetch jobs for that specific user (Employer/Admin viewing their own jobs)
    // In this case, we default to ALL statuses unless specific one is requested.

    if (creatorId) {
      query.creatorId = creatorId
      if (status && status !== "all") {
        query.status = status
      }
      // If no status is provided when filtering by creator, we return ALL jobs (active, pending, rejected)
    } else {
      // Public view or Admin All Jobs view
      if (status && status !== "all") {
        query.status = status
      } else if (!status) {
        // Public view usually only wants active
        query.status = "active"
      }
    }

    if (type && type !== "all") {
      query.type = type
    }

    if (field && field !== "all") {
      query.field = field
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const jobs = await collection.find(query).sort({ postedAt: -1 }).toArray()

    // Map _id to string
    const mappedJobs = jobs.map(job => ({
      ...job,
      _id: job._id.toString()
    }))

    return NextResponse.json({
      success: true,
      data: {
        jobs: mappedJobs,
        total: mappedJobs.length,
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
    const {
      title, company, companyId, location, type, field,
      salary, salaryMin, salaryMax, isNegotiable,
      deadline, description, requirements, benefits,
      relatedMajors, detailedBenefits, creatorId, role, website
    } = body

    // Validate permission (Only Employer or Admin)
    // Ideally use session check here, but relying on payload for now as per context
    // if (role === 'student') return NextResponse.json({ error: "Students cannot post jobs" }, { status: 403 })

    const collection = await getCollection(COLLECTIONS.JOBS)

    const newJob = {
      title,
      company,
      website: website || null,
      companyId: companyId || "unknown", // Should link to company profile
      logo: body.logo || "/placeholder.svg?height=100&width=100", // Default logo
      location,
      type,
      field,
      salary: isNegotiable ? "Thỏa thuận" : salary,
      salaryMin,
      salaryMax,
      isNegotiable,
      deadline,
      description,
      requirements: Array.isArray(requirements) ? requirements : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      detailedBenefits: Array.isArray(detailedBenefits) ? detailedBenefits : [],
      relatedMajors: Array.isArray(relatedMajors) ? relatedMajors : [],

      postedAt: new Date().toISOString(),
      status: role === 'admin' ? 'active' : 'pending', // Admin posts are active immediately
      applicants: 0,
      creatorId,
      views: 0
    }

    const result = await collection.insertOne(newJob)

    return NextResponse.json({
      success: true,
      message: role === 'admin' ? "Đăng tuyển thành công!" : "Đã gửi duyệt tin tuyển dụng!",
      data: { ...newJob, _id: result.insertedId.toString() },
    })
  } catch (error) {
    console.error("Post job error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to post job" },
      { status: 500 }
    )
  }
}
