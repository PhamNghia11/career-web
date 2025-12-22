"use client"

import { Briefcase, FileText, Eye, TrendingUp, Clock, CheckCircle, XCircle, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const studentStats = [
  {
    name: "Đơn đã gửi",
    value: 12,
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-500/20 to-blue-500/10",
  },
  {
    name: "Phỏng vấn",
    value: 3,
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-gradient-to-br from-green-500/20 to-green-500/10",
  },
  {
    name: "Đang chờ",
    value: 5,
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-gradient-to-br from-yellow-500/20 to-yellow-500/10",
  },
  {
    name: "Từ chối",
    value: 4,
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-gradient-to-br from-red-500/20 to-red-500/10",
  },
]

const employerStats = [
  {
    name: "Tin đã đăng",
    value: 8,
    icon: Briefcase,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-500/20 to-blue-500/10",
  },
  {
    name: "Ứng viên",
    value: 156,
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-gradient-to-br from-green-500/20 to-green-500/10",
  },
  {
    name: "Lượt xem",
    value: 2840,
    icon: Eye,
    color: "text-purple-600",
    bgColor: "bg-gradient-to-br from-purple-500/20 to-purple-500/10",
  },
  {
    name: "Tuyển thành công",
    value: 12,
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-500/20 to-emerald-500/10",
  },
]

const adminStats = [
  {
    name: "Tổng người dùng",
    value: 15420,
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-500/20 to-blue-500/10",
  },
  {
    name: "Việc làm đăng",
    value: 2534,
    icon: Briefcase,
    color: "text-green-600",
    bgColor: "bg-gradient-to-br from-green-500/20 to-green-500/10",
  },
  {
    name: "Đánh giá Google",
    value: 847,
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-gradient-to-br from-purple-500/20 to-purple-500/10",
  },
  {
    name: "Lượt truy cập",
    value: 45200,
    icon: Eye,
    color: "text-orange-600",
    bgColor: "bg-gradient-to-br from-orange-500/20 to-orange-500/10",
  },
]

const chartData = [
  { name: "T1", applications: 65, views: 120 },
  { name: "T2", applications: 78, views: 145 },
  { name: "T3", applications: 90, views: 180 },
  { name: "T4", applications: 81, views: 160 },
  { name: "T5", applications: 95, views: 200 },
  { name: "T6", applications: 110, views: 240 },
  { name: "T7", applications: 125, views: 280 },
]

const recentApplications = [
  { id: 1, job: "Frontend Developer", company: "FPT Software", status: "pending", date: "10/12/2025" },
  { id: 2, job: "Marketing Intern", company: "Vingroup", status: "interview", date: "08/12/2025" },
  { id: 3, job: "Business Analyst", company: "Techcombank", status: "rejected", date: "05/12/2025" },
  { id: 4, job: "UI/UX Designer", company: "VNG", status: "accepted", date: "01/12/2025" },
]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  interview: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-green-100 text-green-800",
}

const statusLabels = {
  pending: "Đang chờ",
  interview: "Phỏng vấn",
  rejected: "Từ chối",
  accepted: "Đã nhận",
}

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = user?.role === "admin" ? adminStats : user?.role === "employer" ? employerStats : studentStats

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-lg border border-primary/10">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Xin chào, {user?.name}!</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === "admin"
            ? "Quản lý hệ thống GDU Career Portal"
            : user?.role === "employer"
              ? "Quản lý tin tuyển dụng và ứng viên"
              : "Theo dõi tiến trình ứng tuyển của bạn"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Thống kê theo tháng</CardTitle>
            <CardDescription>Số lượng ứng tuyển và lượt xem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="applications" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Biểu đồ hoạt động</CardTitle>
            <CardDescription>Hoạt động trong 7 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      {user?.role === "student" && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Đơn ứng tuyển gần đây</CardTitle>
            <CardDescription>Theo dõi trạng thái các đơn ứng tuyển</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-medium text-foreground">Vị trí</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Công ty</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Ngày nộp</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-border/30 last:border-0 hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-foreground">{app.job}</td>
                      <td className="py-3 px-4 text-muted-foreground">{app.company}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status as keyof typeof statusColors]}`}
                        >
                          {statusLabels[app.status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{app.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
