import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase() || ""
    const industry = searchParams.get("industry") || ""
    const size = searchParams.get("size") || ""

    // Pagination & Limit
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Random & Exclude
    const isRandom = searchParams.get("random") === "true"
    const excludeId = searchParams.get("excludeId")

    const collection = await getCollection(COLLECTIONS.COMPANIES)

    let query: any = {}

    if (excludeId && ObjectId.isValid(excludeId)) {
      query._id = { $ne: new ObjectId(excludeId) }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } }
      ]
    }

    if (industry) {
      query.industry = industry
    }

    if (size) {
      query.size = size
    }

    let companies = []

    if (isRandom) {
      // Random fetch using $sample (efficient for large datasets)
      const pipeline: any[] = [
        { $match: query },
        { $sample: { size: limit } }
      ]

      // Project only necessary fields for list view if random (usually for widgets)
      pipeline.push({
        $project: {
          name: 1,
          logo: 1,
          industry: 1,
          location: 1,
          size: 1,
          openPositions: 1,
          verified: 1,
          website: 1
        }
      })

      companies = await collection.aggregate(pipeline).toArray()
    } else {
      // Standard paginated fetch
      companies = await collection
        .find(query)
        // Project only necessary fields to reduce payload size
        .project({
          description: 0, // Exclude heavy text fields
          benefits: 0,
          detailedBenefits: 0
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    }

    // Get total only if not random (random is approximate or specialized)
    const total = isRandom ? companies.length : await collection.countDocuments(query)

    return NextResponse.json({
      companies: companies.map(c => ({
        ...c,
        _id: c._id.toString(),
        id: c._id.toString()
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch companies" }, { status: 500 })
  }
}
