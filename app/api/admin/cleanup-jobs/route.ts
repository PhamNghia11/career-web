
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
            // Aggressive normalization: lowercase and remove ALL non-alphanumeric chars
            const normalize = (str: any) => (str || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "")

            const titleNorm = normalize(job.title)
            const companyNorm = normalize(job.company)
            const typeNorm = normalize(job.type)

            // Identifier based on normalized fields
            const key = `${titleNorm}|${companyNorm}|${typeNorm}`

            if (key === "||") continue; // Skip empty jobs

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
                message: `Found and deleted ${result.deletedCount} duplicate jobs`,
                count: result.deletedCount,
                duplicateIds: duplicates
            })
        }

        return NextResponse.json({
            success: true,
            message: "No duplicates found. Database is clean."
        })

    } catch (error) {
        console.error("Cleanup error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to cleanup jobs" },
            { status: 500 }
        )
    }
}
