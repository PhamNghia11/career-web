"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Briefcase,
  User,
  Settings,
  FileText,
  Bell,
  Star,
  Users,
  BarChart3,
  Building,
  LogOut,
  MessageSquare,
  Facebook,
  MessageCircle,
  ArrowLeft,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const studentNav = [
  { name: "Tổng quan", href: "/dashboard", icon: Home },
  { name: "Việc làm đã lưu", href: "/dashboard/saved-jobs", icon: Briefcase },
  { name: "Đơn ứng tuyển", href: "/dashboard/applications", icon: FileText },
  { name: "Hồ sơ cá nhân", href: "/dashboard/profile", icon: User },
  { name: "Thông báo", href: "/dashboard/notifications", icon: Bell },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
]

const employerNav = [
  { name: "Tổng quan", href: "/dashboard", icon: Home },
  { name: "Đăng tin tuyển dụng", href: "/dashboard/post-job", icon: Briefcase },
  { name: "Quản lý tin đăng", href: "/dashboard/my-jobs", icon: FileText },
  { name: "Ứng viên", href: "/dashboard/candidates", icon: Users },
  { name: "Công ty", href: "/dashboard/company", icon: Building },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
]

const adminNav = [
  { name: "Tổng quan", href: "/dashboard", icon: Home },
  { name: "Quản lý người dùng", href: "/dashboard/users", icon: Users },
  { name: "Quản lý việc làm", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Đơn ứng tuyển", href: "/dashboard/applications", icon: FileText },
  { name: "Đánh giá Google", href: "/dashboard/reviews", icon: Star },
  { name: "Thống kê", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Liên hệ", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = user?.role === "admin" ? adminNav : user?.role === "employer" ? employerNav : studentNav

  const roleLabel =
    user?.role === "admin" ? "Quản trị viên" : user?.role === "employer" ? "Nhà tuyển dụng" : "Sinh viên"

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col h-full">
        {/* Back to Home */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-full bg-sidebar-accent group-hover:bg-sidebar-primary transition-colors">
              <ArrowLeft className="h-5 w-5 group-hover:text-sidebar-primary-foreground transition-colors" />
            </div>
            <span className="font-bold text-lg">Gia Dinh University</span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center overflow-hidden border border-sidebar-border">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-sm text-sidebar-foreground/70">{roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* External Links */}
        <div className="px-3 pb-2 space-y-1">
          <a
            href="https://www.facebook.com/GDUStudentCenter/?locale=vi_VN"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-[#1877F2] transition-colors"
            title="Fanpage Trung tâm Trải nghiệm & Việc làm"
          >
            <Facebook className="h-5 w-5" />
            <span>Facebook Việc làm</span>
          </a>
          <a
            href="https://zalo.me/0961121018"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-[#0068FF] transition-colors"
            title="Zalo Đại học Gia Định"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Zalo Trường</span>
          </a>
        </div>

        {/* Admin Panel Link - Only for admins */}
        {user?.role === "admin" && (
          <div className="px-3 pb-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-medium"
            >
              <Settings className="h-5 w-5" />
              <span>🔧 Quản trị Admin</span>
            </Link>
          </div>
        )}

        {/* Logout */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
