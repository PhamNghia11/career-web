import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { parseNormalizedDeadline } from "@/lib/date-utils"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const collection = await getCollection(COLLECTIONS.JOBS)

        // Find all jobs that don't have normalizedDeadline or it's null
        const jobs = await collection.find({
            $or: [
                { normalizedDeadline: { $exists: false } },
                { normalizedDeadline: null }
            ]
        }).toArray()

        console.log(`Found ${jobs.length} jobs to heal`)

        let updatedCount = 0
        for (const job of jobs) {
            const normalized = parseNormalizedDeadline(job.deadline)
            await collection.updateOne(
                { _id: job._id },
                { $set: { normalizedDeadline: normalized } }
            )
            updatedCount++
        }

        return NextResponse.json({
            success: true,
            message: `Successfully healed ${updatedCount} jobs`,
            totalFound: jobs.length,
            updatedCount
        })
    } catch (error: any) {
        console.error("Heal deadlines error:", error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
