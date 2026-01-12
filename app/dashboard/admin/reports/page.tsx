"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Flag, ExternalLink, Mail, Phone, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Report {
    _id: string
    jobId: string
    jobTitle: string
    companyName: string
    reporterName: string
    reporterPhone: string
    reporterEmail: string
    content: string
    status: 'pending' | 'resolved' | 'dismissed'
    createdAt: string
}

export default function AdminReportsPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [user])

    const fetchReports = async () => {
        if (user?.role !== 'admin') {
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/reports')
            const data = await res.json()
            if (data.success) {
                setReports(data.reports)
            }
        } catch (error) {
            console.error("Failed to fetch reports", error)
            toast({
                title: "Lỗi tải dữ liệu",
                description: "Không thể tải danh sách báo cáo.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    if (user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                        <h2 className="text-xl font-bold mb-2">Truy cập bị từ chối</h2>
                        <p className="text-muted-foreground">Bạn cần quyền quản trị viên để xem trang này.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
                    <Flag className="h-8 w-8 text-destructive" />
                    Báo cáo vi phạm
                </h1>
                <p className="text-muted-foreground mt-1">Quản lý các phản ánh về tin tuyển dụng không chính xác.</p>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <p className="text-center text-muted-foreground py-10">Đang tải dữ liệu...</p>
                ) : reports.length === 0 ? (
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                            <p>Không có báo cáo nào. Hệ thống đang hoạt động tốt!</p>
                        </CardContent>
                    </Card>
                ) : (
                    reports.map((report) => (
                        <Card key={report._id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-3">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span className="text-destructive">Báo cáo:</span>
                                            <Link href={`/jobs/${report.jobId}`} target="_blank" className="hover:underline flex items-center gap-1">
                                                {report.jobTitle}
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Tại công ty: <span className="font-medium text-foreground">{report.companyName}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={
                                            report.status === 'pending' ? 'destructive' :
                                                report.status === 'resolved' ? 'default' : 'secondary'
                                        }>
                                            {report.status === 'pending' ? 'Chờ xử lý' :
                                                report.status === 'resolved' ? 'Đã xử lý' : 'Đã bỏ qua'}
                                        </Badge>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(report.createdAt).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Người báo cáo</label>
                                            <div className="mt-1 space-y-1">
                                                <p className="font-medium">{report.reporterName}</p>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="h-3 w-3" />
                                                    {report.reporterPhone}
                                                </div>
                                                {report.reporterEmail && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="h-3 w-3" />
                                                        {report.reporterEmail}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nội dung phản ánh</label>
                                        <div className="bg-red-50 p-3 rounded-md border border-red-100 text-red-900 text-sm leading-relaxed">
                                            {report.content}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
