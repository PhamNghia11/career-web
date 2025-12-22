import { NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

export async function GET() {
  try {
    // Read stats from file exported by Python script
    const statsPath = join(process.cwd(), "public", "data", "reviews-stats.json")

    if (existsSync(statsPath)) {
      const fileContent = readFileSync(statsPath, "utf-8")
      const stats = JSON.parse(fileContent)

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

