import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, currentPassword, newPassword } = body

        if (!userId || !currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Vui lòng điền đầy đủ thông tin" },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
                { status: 400 }
            )
        }

        // Get user from database
        const collection = await getCollection(COLLECTIONS.USERS)
        const user = await collection.findOne({ _id: new ObjectId(userId) })

        if (!user) {
            return NextResponse.json(
                { error: "Không tìm thấy người dùng" },
                { status: 404 }
            )
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Mật khẩu hiện tại không đúng" },
                { status: 401 }
            )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password in database
        await collection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            }
        )

        return NextResponse.json({
            success: true,
            message: "Đổi mật khẩu thành công!"
        })

    } catch (error) {
        console.error("[API] Change password error:", error)
        return NextResponse.json(
            { error: "Đổi mật khẩu thất bại. Vui lòng thử lại." },
            { status: 500 }
        )
    }
}
