"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Flag, ExternalLink, Mail, Phone, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Report {
    _id: string
    jobId: string
    jobTitle: string
    companyName: string
    reporterName: string
    reporterPhone: string
    reporterEmail: string
    reporterUserId?: string
    content: string
    status: 'pending' | 'resolved' | 'dismissed'
    adminResponse?: string
    createdAt: string
    resolvedAt?: string
}

export default function AdminReportsPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)

    // Resolution state
    const [resolutionOpen, setResolutionOpen] = useState(false)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [resolutionData, setResolutionData] = useState({
        status: 'resolved' as 'resolved' | 'dismissed',
        adminResponse: ""
    })
    const [processingId, setProcessingId] = useState<string | null>(null)

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

    const openResolution = (report: Report) => {
        setSelectedReport(report)
        setResolutionData({
            status: report.status === 'pending' ? 'resolved' : report.status as any,
            adminResponse: report.adminResponse || ""
        })
        setResolutionOpen(true)
    }

    const handleResolve = async () => {
        if (!selectedReport) return
        if (!resolutionData.adminResponse.trim()) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng nhập phản hồi xử lý.",
                variant: "destructive"
            })
            return
        }

        try {
            setProcessingId(selectedReport._id)
            const res = await fetch('/api/reports', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId: selectedReport._id,
                    ...resolutionData
                })
            })

            const data = await res.json()
            if (data.success) {
                toast({
                    title: "Thành công",
                    description: "Đã cập nhật trạng thái báo cáo.",
                })
                setResolutionOpen(false)
                fetchReports()
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể xử lý báo cáo. Vui lòng thử lại.",
                variant: "destructive"
            })
        } finally {
            setProcessingId(null)
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
                        <Card key={report._id} className="overflow-hidden border-l-4 border-l-destructive/50 data-[status=resolved]:border-l-green-500 data-[status=dismissed]:border-l-gray-300" data-status={report.status}>
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
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{report.reporterName}</p>
                                                    {report.reporterUserId && (
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-200">Thành viên</Badge>
                                                    )}
                                                </div>
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

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nội dung phản ánh</label>
                                            <div className="bg-red-50 p-3 rounded-md border border-red-100 text-red-900 text-sm leading-relaxed mt-1">
                                                {report.content}
                                            </div>
                                        </div>

                                        {report.adminResponse && (
                                            <div>
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phản hồi từ Admin</label>
                                                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-900 text-sm leading-relaxed mt-1 flex gap-2">
                                                    <MessageSquare className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        {report.adminResponse}
                                                        {report.resolvedAt && (
                                                            <p className="text-[10px] text-blue-400 mt-1 italic">
                                                                Xử lý lúc: {new Date(report.resolvedAt).toLocaleString('vi-VN')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2 flex justify-end">
                                            <Button
                                                size="sm"
                                                variant={report.status === 'pending' ? 'default' : 'outline'}
                                                className={report.status === 'pending' ? "bg-blue-600 hover:bg-blue-700" : ""}
                                                onClick={() => openResolution(report)}
                                            >
                                                {report.status === 'pending' ? 'Xử lý báo cáo' : 'Sửa phản hồi'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Resolution Dialog */}
            <Dialog open={resolutionOpen} onOpenChange={setResolutionOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                            Xử lý báo cáo vi phạm
                        </DialogTitle>
                        <DialogDescription>
                            Phản hồi này sẽ được gửi thông báo đến người báo cáo (nếu là thành viên).
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Tin bị báo cáo</Label>
                                <p className="text-sm font-medium p-2 bg-muted rounded-md">{selectedReport.jobTitle}</p>
                            </div>

                            <div className="space-y-3">
                                <Label>Hướng xử lý</Label>
                                <RadioGroup
                                    value={resolutionData.status}
                                    onValueChange={(val: any) => setResolutionData({ ...resolutionData, status: val })}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="resolved" id="resolved" />
                                        <Label htmlFor="resolved" className="cursor-pointer">Xác nhận vi phạm</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="dismissed" id="dismissed" />
                                        <Label htmlFor="dismissed" className="cursor-pointer">Bỏ qua / Không vi phạm</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="response">Nội dung phản hồi <span className="text-destructive">*</span></Label>
                                <Textarea
                                    id="response"
                                    placeholder="Ví dụ: Cảm ơn bạn, chúng tôi đã gỡ tin này / Tin này vẫn hoàn toàn hợp lệ..."
                                    rows={4}
                                    value={resolutionData.adminResponse}
                                    onChange={(e) => setResolutionData({ ...resolutionData, adminResponse: e.target.value })}
                                />
                                {selectedReport.reporterUserId && (
                                    <p className="text-[11px] text-blue-600 italic">
                                        * Một thông báo sẽ được gửi tự động đến tài khoản của {selectedReport.reporterName}.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResolutionOpen(false)}>Hủy</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleResolve}
                            disabled={!!processingId}
                        >
                            {processingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Xác nhận xử lý
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
