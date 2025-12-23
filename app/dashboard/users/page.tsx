"use client"

import { useState, useEffect } from "react"
import { Search, MoreHorizontal, UserPlus, Shield, Trash2, Edit, Eye } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

// Mock users removed

const roleColors = {
  student: "bg-blue-100 text-blue-800",
  employer: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
}

const roleLabels = {
  student: "Sinh viên",
  employer: "Nhà tuyển dụng",
  admin: "Quản trị viên",
}

export default function UsersManagementPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        console.log("Users API response:", data)
        if (data.success) {
          const usersWithDebug = data.users;
          (usersWithDebug as any).debug = data.debug;
          setUsers(usersWithDebug)
        } else {
          console.error("Users API failed:", data.error)
        }
      } catch (error) {
        console.error("Failed to fetch users", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchUsers()
    } else {
      setLoading(false)
    }
  }, [user])

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Không có quyền truy cập</h2>
            <p className="text-muted-foreground">Bạn cần quyền quản trị viên để xem trang này.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Quản lý người dùng</h1>
          <p className="text-muted-foreground mt-1">Quản lý tài khoản và phân quyền người dùng</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="student">Sinh viên</option>
              <option value="employer">Nhà tuyển dụng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Người dùng</th>
                  <th className="text-left py-3 px-4 font-medium">Vai trò</th>
                  <th className="text-left py-3 px-4 font-medium">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium">Ngày tạo</th>
                  <th className="text-right py-3 px-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">Không tìm thấy người dùng nào</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium overflow-hidden">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              (u.name?.charAt(0) || "U").toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{u.name || "Chưa có tên"}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={roleColors[u.role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}>
                          {roleLabels[u.role as keyof typeof roleLabels] || u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={u.status === "inactive" ? "secondary" : "default"}>
                          {u.status === "inactive" ? "Không hoạt động" : "Hoạt động"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="h-4 w-4 mr-2" />
                              Đổi vai trò
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
