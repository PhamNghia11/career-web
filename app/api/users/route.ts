import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const role = searchParams.get("role") // Filter by role if needed

        // In a real app, verify the requester is an admin here!
        // For now we assume the frontend protects the route or we trust the caller for this demo.

        const collection = await getCollection(COLLECTIONS.USERS)

        let query: any = {}
        if (role && role !== 'all') {
            query.role = role
        }

        // Only show verified users
        // Use $ne: false to include users who might not have the field (legacy) or explicitly true
        query.emailVerified = { $ne: false }

        const users = await collection
            .find(query)
            .sort({ createdAt: -1 })
            .project({ password: 0 }) // Exclude password
            .toArray()

        return NextResponse.json({
            success: true,
            debug: {
                collection: COLLECTIONS.USERS,
                query: query,
                count: users.length,
                dbName: collection.dbName
            },
            users: users.map(user => ({
                ...user,
                _id: user._id.toString(),
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            })),
        })
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
    }
}
