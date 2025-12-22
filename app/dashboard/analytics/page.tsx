"use client"

import { TrendingUp, Users, Briefcase, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"

const trafficData = [
  { name: "T1", visitors: 4200, pageViews: 12500 },
  { name: "T2", visitors: 4800, pageViews: 14200 },
  { name: "T3", visitors: 5100, pageViews: 15800 },
  { name: "T4", visitors: 4900, pageViews: 14900 },
  { name: "T5", visitors: 5600, pageViews: 17200 },
  { name: "T6", visitors: 6200, pageViews: 19500 },
  { name: "T7", visitors: 6800, pageViews: 21200 },
  { name: "T8", visitors: 7100, pageViews: 22800 },
  { name: "T9", visitors: 7500, pageViews: 24500 },
  { name: "T10", visitors: 8200, pageViews: 26800 },
  { name: "T11", visitors: 8900, pageViews: 29200 },
  { name: "T12", visitors: 9500, pageViews: 31500 },
]

const jobCategoryData = [
  { name: "CNTT", jobs: 850, applications: 4200 },
  { name: "Marketing", jobs: 420, applications: 2100 },
  { name: "Kinh doanh", jobs: 380, applications: 1900 },
  { name: "Tài chính", jobs: 290, applications: 1450 },
  { name: "Kế toán", jobs: 220, applications: 1100 },
  { name: "Khác", jobs: 340, applications: 1700 },
]

const userGrowthData = [
  { name: "T7", students: 8500, employers: 320 },
  { name: "T8", students: 9200, employers: 350 },
  { name: "T9", students: 10100, employers: 385 },
  { name: "T10", students: 11200, employers: 420 },
  { name: "T11", students: 12800, employers: 465 },
  { name: "T12", students: 14500, employers: 510 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Thống kê hệ thống</h1>
        <p className="text-muted-foreground mt-1">Theo dõi hiệu suất và tăng trưởng của nền tảng</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lượt truy cập</p>
                <p className="text-2xl font-bold">45,200</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>+18% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sinh viên mới</p>
                <p className="text-2xl font-bold">1,250</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>+24% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Việc làm đăng mới</p>
                <p className="text-2xl font-bold">186</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>+12% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ ứng tuyển</p>
                <p className="text-2xl font-bold">68%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
              <ArrowDownRight className="h-4 w-4" />
              <span>-3% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lưu lượng truy cập</CardTitle>
            <CardDescription>Số lượt truy cập và xem trang theo tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="pageViews"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stackId="2"
                    stroke="hsl(var(--secondary))"
                    fill="hsl(var(--secondary))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tăng trưởng người dùng</CardTitle>
            <CardDescription>Số lượng sinh viên và nhà tuyển dụng mới</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="students"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="employers"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Việc làm theo ngành nghề</CardTitle>
          <CardDescription>Phân bố việc làm và ứng tuyển theo ngành</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobCategoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="jobs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Việc làm" />
                <Bar dataKey="applications" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} name="Ứng tuyển" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
