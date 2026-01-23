import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import { ObjectId } from "mongodb"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.USERS)
        const user = await collection.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            user: {
                ...user,
                _id: user._id.toString(),
            }
        })
    } catch (error) {
        console.error("Get user error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch user" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
        }

        const usersCollection = await getCollection(COLLECTIONS.USERS)

        // 1. Fetch user to get context (email, role) for deep cleanup
        const userToDelete = await usersCollection.findOne({ _id: new ObjectId(id) })
        if (!userToDelete) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const userEmail = userToDelete.email
        const userRole = userToDelete.role

        console.log(`[API DELETE User] Deleting user ${id} (${userEmail}, ${userRole}) and all related data`)

        // 2. Cascade cleanup related data
        try {
            // Notifications for this user
            const notificationsCollection = await getCollection(COLLECTIONS.NOTIFICATIONS)
            await notificationsCollection.deleteMany({ userId: id })

            // Saved jobs
            const savedJobsCollection = await getCollection(COLLECTIONS.SAVED_JOBS)
            await savedJobsCollection.deleteMany({ userId: id })

            // User reviews, likes and comments
            const userReviewsCollection = await getCollection(COLLECTIONS.USER_REVIEWS)
            await userReviewsCollection.deleteMany({ userId: id })

            const reviewLikesCollection = await getCollection(COLLECTIONS.REVIEW_LIKES)
            await reviewLikesCollection.deleteMany({ userId: id })

            const reviewCommentsCollection = await getCollection(COLLECTIONS.REVIEW_COMMENTS)
            await reviewCommentsCollection.deleteMany({ userId: id })

            // Applications submitted BY this user OR applications for jobs OWNED BY this user
            const applicationsCollection = await getCollection(COLLECTIONS.APPLICATIONS)
            const appDeleteResult = await applicationsCollection.deleteMany({
                $or: [
                    { applicantId: id },
                    { email: userEmail },
                    { employerId: id }
                ]
            })
            console.log(`[Cleanup] Deleted ${appDeleteResult.deletedCount} applications`)

            // Cleanup Contact messages
            const contactsCollection = await getCollection(COLLECTIONS.CONTACTS)
            const contactDeleteResult = await contactsCollection.deleteMany({
                $or: [
                    { userId: id },
                    { email: userEmail }
                ]
            })
            console.log(`[Cleanup] Deleted ${contactDeleteResult.deletedCount} contacts`)

            // If Employer/Admin, delete their jobs and applications specifically for those jobs
            if (userRole === "employer" || userRole === "admin") {
                const jobsCollection = await getCollection(COLLECTIONS.JOBS)

                // Find IDs of jobs to delete for application cleanup
                const jobsToDelete = await jobsCollection.find({ creatorId: id }).toArray()
                const jobIds = jobsToDelete.map(j => j._id.toString())

                if (jobIds.length > 0) {
                    // Delete applications to these jobs
                    await applicationsCollection.deleteMany({ jobId: { $in: jobIds } })
                    // Delete the jobs
                    await jobsCollection.deleteMany({ creatorId: id })
                }

                // Delete company profile
                const companiesCollection = await getCollection(COLLECTIONS.COMPANIES)
                await companiesCollection.deleteMany({ creatorId: id })
            }
        } catch (cleanupError) {
            console.error("[API DELETE User] Cleanup error:", cleanupError)
            // Continue with user deletion even if cleanup fails partially
        }

        // 3. Prevent deleting Admin accounts by non-root admins
        const adminEmail = process.env.ADMIN_EMAIL
        const body = await req.json().catch(() => ({})) // Try to get body for requesterEmail
        const requesterEmail = body.requesterEmail

        if (userToDelete.role === "admin" && requesterEmail !== adminEmail) {
            return NextResponse.json({ error: "Chỉ Quản trị viên gốc mới có quyền xóa tài khoản Quản trị viên." }, { status: 403 })
        }

        // 4. Finally delete the user record itself
        const result = await usersCollection.deleteOne({ _id: new ObjectId(id) })

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Failed to delete user record" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: "Tài khoản và toàn bộ dữ liệu liên quan đã được xóa sạch."
        })
    } catch (error) {
        console.error("Delete user error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete user" },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.USERS)
        const currentUser = await collection.findOne({ _id: new ObjectId(id) })

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Root Admin and Admin management protection
        const adminEmail = process.env.ADMIN_EMAIL
        const requesterEmail = body.requesterEmail

        if (currentUser.role === "admin" && requesterEmail !== adminEmail) {
            return NextResponse.json({ error: "Chỉ Quản trị viên gốc mới có quyền chỉnh sửa tài khoản Quản trị viên." }, { status: 403 })
        }

        // Prevent updating to invalid roles if role is present
        if (body.role && !["student", "employer", "admin"].includes(body.role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }

        // Role track restriction
        if (body.role && body.role !== currentUser.role) {
            // Simple mapping: each role is currently its own track
            // student -> only student
            // employer -> only employer
            // admin -> only admin (unless there are sub-roles in future)

            // For now, if current role is X, new role must be X (effectively disabling horizontal role change)
            // If we want to allow future vertical roles, we'd check if they belong to the same category.
            const tracks = {
                student: ["student"],
                employer: ["employer"],
                admin: ["admin"]
            }

            const currentTrack = Object.entries(tracks).find(([_, roles]) => roles.includes(currentUser.role))?.[0]
            const newRoleInSameTrack = currentTrack && tracks[currentTrack as keyof typeof tracks].includes(body.role)

            if (!newRoleInSameTrack) {
                return NextResponse.json({
                    error: `Không thể đổi vai trò từ ${currentUser.role} sang ${body.role}. Đổi vai trò chỉ áp dụng cho tài khoản cùng luồng.`
                }, { status: 400 })
            }
        }

        // Validate phone number if present
        if (body.phone && !/^0\d{9,10}$/.test(body.phone)) {
            return NextResponse.json({ error: "Số điện thoại phải bắt đầu bằng số 0 và có 10-11 số" }, { status: 400 })
        }

        // Filter out fields that shouldn't be updated directly via this API if needed
        // For now allow upgrading body fields
        const updateData = {
            ...body,
            updatedAt: new Date()
        }

        // Remove _id if it exists in body to avoid mongo error
        delete updateData._id

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: "User updated successfully" })
    } catch (error) {
        console.error("Update user error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update user" },
            { status: 500 }
        )
    }
}
