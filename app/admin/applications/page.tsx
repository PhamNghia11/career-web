import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { ApplicationsTable } from "@/components/admin/applications-table"

// Force dynamic rendering to avoid MongoDB connection during build
export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
    const collection = await getCollection(COLLECTIONS.APPLICATIONS)
    const rawApplications = await collection.find().sort({ createdAt: -1 }).toArray()

    // Serialize MongoDB objects to plain JSON for client component
    const applications = rawApplications.map((app) => ({
        ...app,
        _id: app._id.toString(),
        createdAt: app.createdAt instanceof Date ? app.createdAt.toISOString() : app.createdAt
    }))

    return <ApplicationsTable initialApplications={applications} />
}
