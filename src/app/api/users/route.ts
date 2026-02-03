import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/database/connection"
import bcrypt from "bcryptjs"

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

        // Show all users regardless of verification status
        // query.emailVerified = true

        const users = await collection
            .find(query)
            .sort({ createdAt: -1 })
            .project({ password: 0, avatar: 0 }) // Exclude password and avatar for performance
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

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, password, role, creatorEmail } = body

        // Root Admin verification
        const adminEmail = process.env.ADMIN_EMAIL
        if (creatorEmail !== adminEmail) {
            return NextResponse.json({ error: "Chỉ Quản trị viên gốc mới có quyền tạo tài khoản trực tiếp." }, { status: 403 })
        }

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 })
        }

        const collection = await getCollection(COLLECTIONS.USERS)
        const existingUser = await collection.findOne({ email })

        if (existingUser) {
            return NextResponse.json({ error: "Email này đã được sử dụng." }, { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = {
            name,
            email,
            password: hashedPassword,
            role,
            emailVerified: true,
            avatar: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const result = await collection.insertOne(newUser)

        return NextResponse.json({
            success: true,
            message: "Tạo tài khoản thành công!",
            userId: result.insertedId.toString()
        })
    } catch (error) {
        console.error("Create user error:", error)
        return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
    }
}
