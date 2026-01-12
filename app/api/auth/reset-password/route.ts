import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json()

        if (!token || !newPassword) {
            return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.USERS)

        // Find user with valid token and expiration
        const user = await collection.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        })

        if (!user) {
            return NextResponse.json({ error: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" }, { status: 400 })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update user
        await collection.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    updatedAt: new Date()
                },
                $unset: {
                    resetPasswordToken: "",
                    resetPasswordExpires: ""
                }
            }
        )

        return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công" })

    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 })
    }
}
