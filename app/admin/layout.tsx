
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, FileText, Bell, Search, Menu, LogOut, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, isLoading, logout } = useAuth()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Check if user is admin
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                // Not logged in, redirect to login
                router.push("/login?redirect=" + pathname)
            } else if (user.role !== "admin") {
                // Logged in but not admin, redirect to dashboard
                router.push("/dashboard?error=unauthorized")
            }
        }
    }, [user, isLoading, router, pathname])

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // Show access denied for non-admin users
    if (!user || user.role !== "admin") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
                <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Truy cập bị từ chối</h1>
                <p className="text-slate-400 mb-6">Bạn không có quyền truy cập trang quản trị</p>
                <Button onClick={() => router.push("/dashboard")} variant="outline">
                    Quay về Dashboard
                </Button>
            </div>
        )
    }

    const navItems = [
        { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
        { href: "/admin/applications", label: "Đơn ứng tuyển", icon: FileText },
        { href: "/admin/contacts", label: "Liên hệ", icon: Users },
    ]

    const SidebarContent = () => (
        <>
            <div className="flex h-16 items-center px-6 border-b border-slate-800">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <span className="text-blue-400">GDU</span>
                    <span>Career</span>
                    <span className="ml-2 text-xs bg-red-500 px-2 py-0.5 rounded">Admin</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-6 px-4">
                <nav className="flex flex-col space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                ${isActive
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    }
                        `}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-slate-800">
                <div className="mb-3 px-3 py-2 bg-slate-800 rounded-lg">
                    <p className="text-xs text-slate-400">Đăng nhập với</p>
                    <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <div
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Đăng xuất</span>
                </div>
            </div>
        </>
    )

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-slate-900 text-white md:flex">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar & Header */}
            <div className="flex flex-1 flex-col md:pl-64">
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu size={20} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 bg-slate-900 text-white border-slate-800 w-64">
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>

                        <div className="hidden md:flex items-center relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Tìm kiếm..."
                                className="w-64 pl-9 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-gray-500">
                            <Bell size={20} />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="bg-blue-600 text-white">
                                            {user.name?.charAt(0).toUpperCase() || "A"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                                    Cài đặt
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    )
}

