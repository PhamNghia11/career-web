"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Search, Bell, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useAuth()
  const router = useRouter()

  const navigation = [
    { name: "Trang chủ", href: "/" },
    { name: "Việc làm", href: "/jobs" },
    { name: "Doanh nghiệp", href: "/companies" },
    { name: "Đánh giá GDU", href: "/reviews" },
    { name: "Liên hệ", href: "/contact" },
  ]

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery)}`)
      setShowSearch(false)
      setSearchQuery("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white text-primary shadow-md border-b border-gray-100">
      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-28 lg:h-32">
          {/* Logo */}
          <Link href="/" className="flex items-center mr-4">
            <img
              src="/gdu-logo.png"
              alt="Gia Dinh University"
              className="h-20 lg:h-24 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-5 py-3 rounded-md hover:bg-primary/10 transition-colors font-semibold text-lg text-gray-800 hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:bg-primary/10"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-6 w-6" />
            </Button>

            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:bg-primary/10 relative"
                    >
                      <Bell className="h-6 w-6" />
                      <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        3
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                      <span className="font-semibold text-sm">Thông báo</span>
                      <span className="text-xs text-primary cursor-pointer hover:underline">Đánh dấu đã đọc</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      <DropdownMenuItem className="cursor-pointer p-4 items-start gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none mb-1">Hồ sơ được xem</p>
                          <p className="text-xs text-muted-foreground">Nhà tuyển dụng FPT Software đã xem hồ sơ của bạn.</p>
                          <p className="text-[10px] text-gray-400 mt-1">2 giờ trước</p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer p-4 items-start gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none mb-1">Việc làm phù hợp mới</p>
                          <p className="text-xs text-muted-foreground">Có 5 việc làm mới phù hợp với kỹ năng ReactJS của bạn.</p>
                          <p className="text-[10px] text-gray-400 mt-1">5 giờ trước</p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer p-4 items-start gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-gray-300 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none mb-1">Cập nhật hồ sơ</p>
                          <p className="text-xs text-muted-foreground">Đừng quên cập nhật CV mới nhất để thu hút nhà tuyển dụng.</p>
                          <p className="text-[10px] text-gray-400 mt-1">1 ngày trước</p>
                        </div>
                      </DropdownMenuItem>
                    </div>
                    <div className="p-2 border-t border-gray-100 text-center">
                      <Link href="/notifications" className="text-xs text-primary hover:underline font-medium">
                        Xem tất cả
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 pr-2 pl-2">
                      {user.avatar ? (
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-primary/20">
                          <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <span className="hidden md:inline font-semibold text-sm">{user.name}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Link href="/dashboard" className="w-full">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/dashboard/profile" className="w-full">
                        Hồ sơ cá nhân
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/dashboard/settings" className="w-full">
                        Cài đặt
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href="/admin" className="w-full text-red-600 font-medium">
                            🔧 Quản trị Admin
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-primary hover:bg-primary/10 hidden sm:flex font-semibold text-base"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-semibold text-base px-6">Đăng ký</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-primary hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 max-w-2xl mx-auto">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tìm việc làm, công ty, vị trí..."
                className="bg-transparent border-none text-gray-800 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 text-white">
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 rounded-md hover:bg-primary/10 transition-colors font-semibold text-gray-800 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
