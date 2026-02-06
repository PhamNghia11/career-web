import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase() || ""
    const industry = searchParams.get("industry") || ""
    const size = searchParams.get("size") || ""

    const collection = await getCollection(COLLECTIONS.COMPANIES)

    let query: any = {}

    if (search) {
      // Optimized search:
      // 1. Text index search would be faster but requires index setup.
      // 2. For now, we use $regex but with a $text fallback if we had one.
      // Ideally, we should migrate to Atlas Search or create a text index.
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } }
        // Removed description search to improve performance as it's a large text field
        // { description: { $regex: search, $options: "i" } }
      ]
    }

    if (industry) {
      query.industry = industry
    }

    if (size) {
      query.size = size
    }

    const companies = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      companies: companies.map(c => ({
        ...c,
        _id: c._id.toString(),
        id: c._id.toString() // Map _id to id for frontend compatibility
      })),
      total: companies.length
    })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch companies" }, { status: 500 })
  }
}
