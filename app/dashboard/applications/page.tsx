"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { FileText, Mail, Phone, Calendar, User, CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Application {
  _id: string
  jobId: string
  jobTitle: string
  companyName: string
  fullname: string
  email: string
  phone: string
  message: string
  cvOriginalName: string
  status: "new" | "reviewed" | "interviewed" | "rejected" | "hired"
  createdAt: string
  employerId?: string
}

export default function ApplicationsPage() {
  const { user, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [cvLoading, setCvLoading] = useState(false)
  const [cvUrl, setCvUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && user) {
      fetchApplications()
    }
  }, [isLoading, user])

  const fetchApplications = async () => {
    try {
      const role = user?.role || "student"
      const queryParams = new URLSearchParams()
      queryParams.set("role", role)

      if (role === "student") {
        queryParams.set("email", user?.email || "")
      } else if (role === "employer") {
        queryParams.set("employerId", user?.id || "")
      }

      // Support filtering by jobId from URL
      const jobIdFromUrl = searchParams.get("jobId")
      if (jobIdFromUrl) {
        queryParams.set("jobId", jobIdFromUrl)
      }

      const res = await fetch(`/api/applications?${queryParams.toString()}`)
      const data = await res.json()

      if (data.success) {
        setApplications(data.data)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewCV = async (app: Application) => {
    setSelectedApp(app)
    setCvUrl(null)
    setCvLoading(true)

    try {
      const res = await fetch(`/api/applications/${app._id}`)
      const data = await res.json()

      if (data.success && data.data.cvBase64) {
        setCvUrl(data.data.cvBase64)
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải CV",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching CV:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải CV",
        variant: "destructive"
      })
    } finally {
      setCvLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Mới</Badge>
      case "reviewed":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Đã xem</Badge>
      case "interviewed":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Phỏng vấn</Badge>
      case "hired":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đã tuyển</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Từ chối</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  // Handle status change by admin/employer
  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        // Update local state
        setApplications(prev =>
          prev.map(app => app._id === appId ? { ...app, status: newStatus as Application["status"] } : app)
        )

        const statusText: Record<string, string> = {
          reviewed: "Đã xem",
          interviewed: "Mời phỏng vấn",
          hired: "Đã tuyển",
          rejected: "Từ chối"
        }

        toast({
          title: "Cập nhật thành công",
          description: `Trạng thái đã chuyển thành "${statusText[newStatus] || newStatus}". Thông báo đã được gửi đến ứng viên.`,
        })
      } else {
        throw new Error("Failed to update status")
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive"
      })
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý ứng tuyển</h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === "student"
                ? "Theo dõi trạng thái các vị trí bạn đã ứng tuyển"
                : "Quản lý hồ sơ ứng viên cho các vị trí tuyển dụng"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách hồ sơ ({applications.length})</CardTitle>
            <CardDescription>
              {user?.role === "student"
                ? "Danh sách các công việc bạn đã nộp hồ sơ"
                : "Danh sách ứng viên mới nhất"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có dữ liệu</h3>
                <p className="text-gray-500">
                  {user?.role === "student"
                    ? "Bạn chưa ứng tuyển vị trí nào"
                    : "Chưa có ứng viên nào nộp hồ sơ"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vị trí / Công ty</TableHead>
                      <TableHead>Ứng viên</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>Ngày nộp</TableHead>
                      <TableHead>CV</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app._id}>
                        <TableCell>
                          <div className="font-medium text-blue-900">{app.jobTitle}</div>
                          <div className="text-sm text-gray-500">{app.companyName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{app.fullname}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              {app.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {app.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(app.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={() => handleViewCV(app)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Xem CV
                          </Button>
                        </TableCell>
                        <TableCell>
                          {/* Students see badge, Admin/Employer see dropdown to change status */}
                          {user?.role === "student" ? (
                            getStatusBadge(app.status)
                          ) : (
                            <Select
                              value={app.status}
                              onValueChange={(value) => handleStatusChange(app._id, value)}
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue>{getStatusBadge(app.status)}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Mới
                                  </span>
                                </SelectItem>
                                <SelectItem value="reviewed">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                    Đã xem
                                  </span>
                                </SelectItem>
                                <SelectItem value="interviewed">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    Mời phỏng vấn
                                  </span>
                                </SelectItem>
                                <SelectItem value="hired">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Đã tuyển
                                  </span>
                                </SelectItem>
                                <SelectItem value="rejected">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    Từ chối
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>CV: {selectedApp?.fullname} - {selectedApp?.jobTitle}</span>
              <Button variant="outline" size="sm" onClick={() => selectedApp && handleViewCV(selectedApp)}>
                Tải lại
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-gray-100 rounded-md overflow-hidden relative">
            {cvLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : cvUrl ? (
              <iframe
                src={cvUrl}
                className="w-full h-full"
                title="CV Preview"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Không thể hiển thị CV
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
