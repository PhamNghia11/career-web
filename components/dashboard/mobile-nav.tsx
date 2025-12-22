"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, Briefcase, User, Settings, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "Tổng quan", href: "/dashboard", icon: Home },
    { name: "Việc làm", href: "/dashboard/jobs", icon: Briefcase },
    { name: "Hồ sơ", href: "/dashboard/profile", icon: User },
    { name: "Thông báo", href: "/dashboard/notifications", icon: Bell },
    { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground font-bold px-2 py-1 rounded">GDU</div>
          <span className="font-bold">Gia Dinh University</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-sidebar text-sidebar-foreground shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground font-bold px-2 py-1 rounded">
                  GDU
                </div>
                <span className="font-bold">Gia Dinh University</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="px-4 py-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-sidebar-foreground/70">{user?.email}</p>
                </div>
              </div>
            </div>

            <nav className="px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "hover:bg-sidebar-accent text-sidebar-foreground/80",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 px-2 py-4 border-t border-sidebar-border">
              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full hover:bg-sidebar-accent text-sidebar-foreground/80 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
