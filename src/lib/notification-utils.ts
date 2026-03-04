import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"

export type NotificationType = 'email' | 'push' | 'newJobs'

/**
 * Checks if a user has enabled a specific notification type.
 * Defaults to true for email and newJobs, false for push if not set.
 */
export async function checkNotificationPreference(
    userId: string | ObjectId | null | undefined,
    type: NotificationType
): Promise<boolean> {
    if (!userId) return true // Default to true if no user associated (e.g. system alerts)

    try {
        const usersCollection = await getCollection(COLLECTIONS.USERS)
        let queryId = userId
        if (typeof userId === 'string') {
            if (ObjectId.isValid(userId)) {
                queryId = new ObjectId(userId)
            } else {
                // If not a valid ObjectId string, it might be a custom ID or legacy string
                // We'll query it as a string
                queryId = userId as any
            }
        }

        const user = await usersCollection.findOne({ _id: queryId as any })

        if (!user || !user.notificationSettings) {
            // Default settings if none exist
            if (type === 'push') return false
            return true
        }

        return user.notificationSettings[type] ?? (type === 'push' ? false : true)
    } catch (error) {
        console.error(`Error checking notification preference for ${userId}:`, error)
        return true // Default to sending if check fails to ensure critical info isn't lost
    }
}
