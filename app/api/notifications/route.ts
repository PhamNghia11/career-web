import { NextResponse } from "next/server"
import { getCollection, COLLECTIONS } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface Notification {
  _id?: ObjectId
  userId: string
  type: "job" | "message" | "interview" | "system" | "visitor"
  title: string
  message: string
  read: boolean
  createdAt: Date
  link?: string
}

// GET - Lấy notifications của user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 })
    }

    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS)
    const notifications = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    // Count unread notifications
    const unreadCount = notifications.filter((n) => !n.read).length

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// POST - Tạo notification mới
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type, title, message, link } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS)
    const notification: Omit<Notification, "_id"> = {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
      link,
    }

    const result = await collection.insertOne(notification)

    return NextResponse.json({
      success: true,
      data: { ...notification, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ success: false, error: "Failed to create notification" }, { status: 500 })
  }
}

// PATCH - Đánh dấu đã đọc
export async function PATCH(request: Request) {
  try {
    const { notificationId, action, userId } = await request.json()

    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS)

    if (action === "mark_read" && notificationId) {
      await collection.updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { read: true } }
      )
      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      })
    }

    if (action === "mark_all_read" && userId) {
      await collection.updateMany(
        { userId, read: false },
        { $set: { read: true } }
      )
      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 })
  }
}

// DELETE - Xóa notification
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")

    if (!notificationId) {
      return NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 })
    }

    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS)
    await collection.deleteOne({ _id: new ObjectId(notificationId) })

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ success: false, error: "Failed to delete notification" }, { status: 500 })
  }
}
