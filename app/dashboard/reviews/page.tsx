"use client"

import { useState } from "react"
import { Star, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock Google Reviews data
const mockReviews = [
  {
    id: "1",
    author: "Nguyen Minh Tuan",
    rating: 5,
    content:
      "Trường đại học rất tốt, giảng viên nhiệt tình, cơ sở vật chất hiện đại. Môi trường học tập thân thiện và năng động.",
    date: "10/12/2025",
    likes: 24,
  },
  {
    id: "2",
    author: "Tran Thi Mai",
    rating: 4,
    content: "Chương trình đào tạo phù hợp với thực tiễn. Sinh viên được thực hành nhiều dự án thực tế.",
    date: "08/12/2025",
    likes: 18,
  },
  {
    id: "3",
    author: "Le Van Hung",
    rating: 5,
    content: "Đội ngũ hỗ trợ sinh viên rất chuyên nghiệp. Các hoạt động ngoại khóa phong phú.",
    date: "05/12/2025",
    likes: 15,
  },
  {
    id: "4",
    author: "Pham Thi Lan",
    rating: 3,
    content: "Cần cải thiện thêm về cơ sở vật chất thư viện và phòng thực hành.",
    date: "01/12/2025",
    likes: 8,
  },
  {
    id: "5",
    author: "Hoang Duc Anh",
    rating: 5,
    content: "Tuyệt vời! Môi trường học tập chuyên nghiệp, giảng viên giàu kinh nghiệm thực tiễn.",
    date: "28/11/2025",
    likes: 32,
  },
]

const monthlyData = [
  { name: "T6", reviews: 45, avgRating: 4.2 },
  { name: "T7", reviews: 52, avgRating: 4.3 },
  { name: "T8", reviews: 48, avgRating: 4.1 },
  { name: "T9", reviews: 61, avgRating: 4.4 },
  { name: "T10", reviews: 73, avgRating: 4.5 },
  { name: "T11", reviews: 89, avgRating: 4.6 },
  { name: "T12", reviews: 95, avgRating: 4.7 },
]

const ratingDistribution = [
  { name: "5 sao", value: 450, color: "#22c55e" },
  { name: "4 sao", value: 280, color: "#84cc16" },
  { name: "3 sao", value: 85, color: "#eab308" },
  { name: "2 sao", value: 22, color: "#f97316" },
  { name: "1 sao", value: 10, color: "#ef4444" },
]

export default function ReviewsDashboardPage() {
  const { user } = useAuth()
  const [dateFilter, setDateFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")

  const totalReviews = 847
  const avgRating = 4.5
  const thisMonthReviews = 95

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Đánh giá Google Maps</h1>
          <p className="text-muted-foreground mt-1">Thống kê và phân tích đánh giá về GDU trên Google Maps</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Cập nhật
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
                <p className="text-3xl font-bold">{totalReviews}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>+12% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                <p className="text-3xl font-bold">{avgRating}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
              </div>
            </div>
            <div className="mt-2">{renderStars(Math.round(avgRating))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tháng này</p>
                <p className="text-3xl font-bold">{thisMonthReviews}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>+7% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">5 sao</p>
                <p className="text-3xl font-bold">53%</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "53%" }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng đánh giá theo tháng</CardTitle>
            <CardDescription>Số lượng đánh giá và điểm trung bình</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="reviews" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgRating"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố đánh giá</CardTitle>
            <CardDescription>Tỷ lệ các mức đánh giá</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {ratingDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Đánh giá gần đây</CardTitle>
              <CardDescription>Danh sách các đánh giá mới nhất từ Google Maps</CardDescription>
            </div>
            <div className="flex gap-2">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">Tất cả sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium flex-shrink-0">
                      {review.author.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{review.author}</span>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{review.date}</p>
                      <p className="mt-2 text-foreground">{review.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{review.likes} lượt thích</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      review.rating >= 4
                        ? "bg-green-100 text-green-800"
                        : review.rating === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {review.rating} sao
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
