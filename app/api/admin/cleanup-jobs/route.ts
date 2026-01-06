
import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const collection = await getCollection(COLLECTIONS.JOBS)

        // Find all jobs sorted by title
        const jobs = await collection.find({}).sort({ title: 1, postedAt: -1 }).toArray()

        const seen = new Set()
        const duplicates = []

        for (const job of jobs) {
            // Identifier based on title, company, and type
            const key = `${job.title}|${job.company}|${job.type}`.toLowerCase()

            if (seen.has(key)) {
                duplicates.push(job._id)
            } else {
                seen.add(key)
            }
        }

        if (duplicates.length > 0) {
            const result = await collection.deleteMany({
                _id: { $in: duplicates }
            })

            return NextResponse.json({
                success: true,
                message: `Cleaned up ${result.deletedCount} duplicate jobs`,
                deletedIds: duplicates
            })
        }

        return NextResponse.json({
            success: true,
            message: "No duplicates found"
        })

    } catch (error) {
        console.error("Cleanup error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to cleanup jobs" },
            { status: 500 }
        )
    }
}
