"use client"

import { useState, useEffect } from "react"
import { FileText, Calendar, Eye, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyTitle, EmptyDescription, EmptyAction } from "@/components/ui/empty"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Application {
  id: string
  jobTitle: string
  company: string
  companyLogo: string
  appliedDate: string
  status: "pending" | "reviewing" | "interview" | "rejected" | "accepted"
}

const statusColors = {
  pending: "bg-gray-500/20 text-gray-700 border border-gray-500/30",
  reviewing: "bg-blue-500/20 text-blue-700 border border-blue-500/30",
  interview: "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30",
  rejected: "bg-red-500/20 text-red-700 border border-red-500/30",
  accepted: "bg-green-500/20 text-green-700 border border-green-500/30",
}

const statusLabels = {
  pending: "Đang chờ",
  reviewing: "Đang xem xét",
  interview: "Phỏng vấn",
  rejected: "Từ chối",
  accepted: "Chấp nhận",
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/applications")
      const result = await response.json()

      if (result.success) {
        const formattedData = result.data.map((app: any) => ({
          ...app,
          appliedDate: new Date(app.appliedDate).toLocaleDateString("vi-VN"),
        }))
        setApplications(formattedData)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch applications:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đơn ứng tuyển",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications?id=${applicationId}`, { method: "DELETE" })
      const result = await response.json()

      if (result.success) {
        setApplications(applications.filter((app) => app.id !== applicationId))
        toast({
          title: "Đã rút đơn",
          description: "Đã rút đơn ứng tuyển thành công",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể rút đơn ứng tuyển",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Đơn ứng tuyển</h1>
          <p className="text-muted-foreground mt-1">Theo dõi trạng thái các đơn ứng tuyển của bạn</p>
        </div>
        <Card>
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Đơn ứng tuyển</h1>
        <p className="text-muted-foreground mt-1">
          Bạn có <span className="font-semibold text-foreground">{applications.length}</span> đơn ứng tuyển
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="p-12">
          <Empty>
            <FileText className="h-12 w-12" />
            <EmptyTitle>Chưa có đơn ứng tuyển nào</EmptyTitle>
            <EmptyDescription>Hãy bắt đầu tìm kiếm và ứng tuyển vào các vị trí phù hợp với bạn</EmptyDescription>
            <EmptyAction>
              <Link href="/jobs">
                <Button>Tìm việc làm</Button>
              </Link>
            </EmptyAction>
          </Empty>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Công ty</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.jobTitle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={app.companyLogo || "/placeholder.svg"}
                          alt={app.company}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <span>{app.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {app.appliedDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[app.status]}>{statusLabels[app.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleWithdraw(app.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
