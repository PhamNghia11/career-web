"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, Trash2, Briefcase, MessageSquare, Calendar, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

interface Notification {
    _id: string
    type: "job" | "job_pending" | "message" | "interview" | "system" | "visitor"
    title: string
    message: string
    read: boolean
    createdAt: string
    link?: string
}

const typeColors: any = {
    job: "text-blue-500",
    job_pending: "text-blue-600",
    message: "text-green-500",
    interview: "text-purple-500",
    system: "text-gray-500",
    visitor: "text-orange-500",
}

const typeIcons: any = {
    job: Briefcase,
    job_pending: Briefcase,
    message: MessageSquare,
    interview: Calendar,
    system: Info,
    visitor: Bell,
}

export function NotificationBell() {
    const { user } = useAuth()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const fetchNotifications = async () => {
        const userId = user?.id || (user as any)?._id
        if (!userId) return

        try {
            setLoading(true)
            const response = await fetch(`/api/notifications?userId=${userId}&role=${user?.role || ''}`)
            const data = await response.json()

            if (data.success) {
                setNotifications(data.data)
                setUnreadCount(data.unreadCount)
            }
        } catch (error) {
            console.error("Error fetching notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [user?.id, (user as any)?._id])

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId, action: "mark_read" }),
            })
            setNotifications(prev =>
                prev.map(n => (n._id === notificationId ? { ...n, read: true } : n))
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    const markAllAsRead = async () => {
        const userId = user?.id || (user as any)?._id
        if (!userId) return

        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action: "mark_all_read", role: user?.role }),
            })
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Error marking all as read:", error)
        }
    }

    const deleteNotification = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications?id=${notificationId}`, {
                method: "DELETE",
            })
            setNotifications(prev => prev.filter(n => n._id !== notificationId))
        } catch (error) {
            console.error("Error deleting notification:", error)
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "Vừa xong"
        if (minutes < 60) return `${minutes} phút trước`
        if (hours < 24) return `${hours} giờ trước`
        if (days < 7) return `${days} ngày trước`
        return date.toLocaleDateString("vi-VN")
    }

    if (!user) return null

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-primary hover:bg-primary/10"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between px-3 py-2 border-b bg-white sticky top-0 z-10">
                    <h3 className="font-semibold text-sm">Thông báo</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary hover:text-primary/80"
                            onClick={markAllAsRead}
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Đọc tất cả
                        </Button>
                    )}
                </div>

                {loading && notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        Đang tải...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        Không có thông báo
                    </div>
                ) : (
                    notifications.slice(0, 10).map((notification) => {
                        const Icon = typeIcons[notification.type] || Bell
                        const colorClass = typeColors[notification.type] || "text-gray-500"

                        // Smart Fallback Link Logic (Enhanced)
                        let finalLink = notification.link
                        const lowerTitle = notification.title.toLowerCase()
                        const lowerMessage = notification.message.toLowerCase()

                        if (!finalLink || finalLink === "#") {
                            // Check by type or title keywords
                            if (notification.type === "job" || notification.type === "job_pending" || lowerTitle.includes("tin tuyển dụng") || lowerTitle.includes("hồ sơ")) {
                                if (user?.role === "admin") finalLink = "/dashboard/jobs"
                                else if (user?.role === "employer") finalLink = "/dashboard/my-jobs"
                            } else if (notification.type === "message" || lowerTitle.includes("tin nhắn") || lowerMessage.includes("đã nhắn tin")) {
                                finalLink = "/dashboard/messages"
                            } else if (notification.type === "visitor" || lowerTitle.includes("truy cập")) {
                                finalLink = "/dashboard/visitors"
                            }
                        }

                        const handleItemClick = (e: React.MouseEvent | React.PointerEvent) => {
                            // Don't trigger if clicking the delete button
                            if ((e.target as HTMLElement).closest('.delete-notif-btn')) {
                                return
                            }

                            // Immediate effect for UI
                            if (!notification.read) markAsRead(notification._id)

                            if (finalLink) {
                                setOpen(false)
                                const url = finalLink
                                const path = url.startsWith('http') ? url : (url.startsWith('/') ? url : `/${url}`)

                                // Use direct navigation for high reliability
                                try {
                                    router.push(path)
                                    // Forced fallback after a short delay
                                    setTimeout(() => {
                                        if (window.location.pathname !== path && !path.includes('#') && !url.startsWith('http')) {
                                            window.location.href = path
                                        }
                                    }, 500)
                                } catch (err) {
                                    window.location.href = path
                                }
                            }
                        }

                        return (
                            <DropdownMenuItem
                                key={notification._id}
                                asChild
                                className={`p-0 focus:bg-transparent ${!notification.read ? "bg-blue-50/50" : ""}`}
                            >
                                <div
                                    className="flex items-center w-full group relative hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer select-none"
                                    onClick={handleItemClick}
                                >
                                    <div className="flex flex-1 items-start gap-3 p-3">
                                        <div className={`mt-0.5 ${colorClass} shrink-0`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className={`text-sm font-semibold leading-tight mb-1 ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">
                                                    {formatTime(notification.createdAt)}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-normal">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Delete Button - Separated and uses class for detection */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 mr-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 delete-notif-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            e.preventDefault()
                                            deleteNotification(notification._id)
                                        }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </DropdownMenuItem>
                        )
                    })
                )}

                {notifications.length > 10 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-center text-primary text-sm py-2 cursor-pointer justify-center font-medium"
                            onSelect={() => {
                                router.push('/dashboard/notifications')
                                setOpen(false)
                            }}
                        >
                            Xem tất cả thông báo
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
