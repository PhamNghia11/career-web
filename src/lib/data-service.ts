import { getCollection, COLLECTIONS } from "@/database/connection"
import { unstable_cache } from "next/cache"
import { getStartOfToday } from "./date-utils"

// Cache duration: 1 hour for slides, 10 mins for jobs, 1 hour for config
const REVALIDATE_SLIDES = 3600
const REVALIDATE_JOBS = 600
const REVALIDATE_CONFIG = 3600

export const getHeroSlides = unstable_cache(
    async (page: string = "home") => {
        try {
            const collection = await getCollection(COLLECTIONS.HERO_SLIDES)
            let query: any = { isActive: true }
            if (page !== "all") {
                query.page = page
            }
            const slides = await collection.find(query).sort({ order: 1, createdAt: -1 }).toArray()
            return slides.map(s => ({ ...s, _id: s._id.toString() }))
        } catch (error) {
            console.error(`Error fetching hero slides for ${page}:`, error)
            return []
        }
    },
    ['hero-slides'],
    { revalidate: REVALIDATE_SLIDES, tags: ['hero-slides'] }
)

export const getLatestJobs = unstable_cache(
    async (limit: number = 4) => {
        try {
            const startOfToday = getStartOfToday()
            const collection = await getCollection(COLLECTIONS.JOBS)

            // Simplified aggregation using normalizedDeadline
            const jobs = await collection.aggregate([
                {
                    $match: {
                        status: "active",
                        $or: [
                            { normalizedDeadline: { $gte: startOfToday } },
                            { deadline: { $in: [null, "", "Vô thời hạn"] } },
                            // Fallback for old jobs not yet migrated (though migration should be done)
                            { normalizedDeadline: { $exists: false } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: COLLECTIONS.APPLICATIONS,
                        let: { jobId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$jobId", "$$jobId"] },
                                            { $eq: ["$status", "hired"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "hiredApplications"
                    }
                },
                {
                    $addFields: {
                        hiredCount: { $size: "$hiredApplications" }
                    }
                },
                {
                    $match: {
                        $expr: {
                            $or: [
                                { $eq: ["$quantity", -1] },
                                { $lt: ["$hiredCount", { $ifNull: ["$quantity", 1] }] }
                            ]
                        }
                    }
                },
                {
                    $sort: { postedAt: -1 }
                },
                {
                    $limit: limit
                },
                {
                    $project: {
                        hiredApplications: 0,
                        // Exclude heavy fields for list view
                        description: 0,
                        requirements: 0,
                        benefits: 0,
                        detailedBenefits: 0
                    }
                }
            ]).toArray()

            return jobs.map(j => ({ ...j, _id: j._id.toString() }))
        } catch (error) {
            console.error("Error fetching latest jobs:", error)
            return []
        }
    },
    ['latest-jobs'],
    { revalidate: REVALIDATE_JOBS, tags: ['latest-jobs', 'jobs'] }
)

export const getSiteConfig = unstable_cache(
    async (key: string) => {
        try {
            const collection = await getCollection(COLLECTIONS.SITE_CONFIGS)
            const config = await collection.findOne({ key })
            return config ? { ...config, _id: config._id.toString() } : null
        } catch (error) {
            console.error(`Error fetching site config for ${key}:`, error)
            return null
        }
    },
    ['site-config'],
    { revalidate: REVALIDATE_CONFIG }
)
