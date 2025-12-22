import { NextResponse } from "next/server"

const mockNotifications = [
  {
    id: "1",
    type: "job" as const,
    title: "Đơn ứng tuyển được xem xét",
    message: "FPT Software đang xem xét đơn ứng tuyển của bạn cho vị trí Frontend Developer Intern",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
  {
    id: "2",
    type: "message" as const,
    title: "Tin nhắn mới từ nhà tuyển dụng",
    message: "Vingroup đã gửi tin nhắn về lịch phỏng vấn",
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    read: false,
  },
  {
    id: "3",
    type: "interview" as const,
    title: "Lịch phỏng vấn mới",
    message: "Bạn có lịch phỏng vấn với Techcombank vào ngày 20/12/2025 lúc 14:00",
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    read: false,
  },
  {
    id: "4",
    type: "system" as const,
    title: "Cập nhật hồ sơ",
    message: "Hồ sơ của bạn đã được cập nhật thành công",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: "5",
    type: "job" as const,
    title: "Việc làm mới phù hợp",
    message: "5 việc làm mới phù hợp với hồ sơ của bạn",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
]

export async function GET() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return NextResponse.json({
      success: true,
      data: mockNotifications,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { notificationId, action } = await request.json()

    if (action === "mark_read") {
      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      })
    }

    if (action === "mark_all_read") {
      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")

    if (!notificationId) {
      return NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete notification" }, { status: 500 })
  }
}
