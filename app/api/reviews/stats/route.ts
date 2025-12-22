import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get base URL from request for fetching static files
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`

    // Fetch stats from public URL - works both locally and on Vercel
    const response = await fetch(`${baseUrl}/data/reviews-stats.json`)

    if (response.ok) {
      const stats = await response.json()

      return NextResponse.json({
        success: true,
        stats,
        source: "json",
      })
    }

    return NextResponse.json({
      success: true,
      stats: {
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        verified_count: 0,
      },
      source: "none",
      message: "Chưa có dữ liệu. Vui lòng chạy script Python để xử lý dữ liệu.",
    })
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
      },
      { status: 500 },
    )
  }
}
