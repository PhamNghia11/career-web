"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { FileText, Clock, Briefcase, ChevronRight, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const statusLabels: Record<string, string> = {
    pending: "Đang chờ",
    reviewing: "Đang xem",
    interview: "Phỏng vấn",
    rejected: "Từ chối",
    accepted: "Đã nhận",
    new: "Mới gửi"
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewing: "bg-blue-100 text-blue-800",
    interview: "bg-purple-100 text-purple-800",
    rejected: "bg-red-100 text-red-800",
    accepted: "bg-green-100 text-green-800",
    new: "bg-gray-100 text-gray-800"
}

export function StudentDashboardContent() {
    const { user } = useAuth()
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchApps = async () => {
            if (user?.email) {
                try {
                    const res = await fetch(`/api/applications?role=student&email=${user.email}`)
                    const data = await res.json()
                    if (data.success) {
                        setApplications(data.data)
                    }
                } catch (e) {
                    console.error("Fetch student apps error", e)
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchApps()
    }, [user])

    const pendingCount = applications.filter(a => ['pending', 'new', 'reviewing'].includes(a.status)).length
    const interviewCount = applications.filter(a => a.status === 'interview').length
    const acceptedCount = applications.filter(a => a.status === 'accepted').length

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Xin chào, {user?.name}!</h2>
                <p className="text-blue-100 mb-6 max-w-2xl">
                    Chào mừng bạn quay trở lại. Bạn có <strong>{pendingCount} đơn ứng tuyển</strong> đang chờ phản hồi.
                    Hãy tiếp tục tìm kiếm cơ hội nghề nghiệp phù hợp nhé.
                </p>
                <div className="flex gap-3">
                    <Button variant="secondary" asChild className="font-semibold">
                        <Link href="/jobs">Tìm việc ngay</Link>
                    </Button>
                    <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10" asChild>
                        <Link href="/dashboard/profile">Cập nhật hồ sơ</Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{applications.length}</div>
                        <div className="text-sm text-muted-foreground">Đã ứng tuyển</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-1">{pendingCount}</div>
                        <div className="text-sm text-muted-foreground">Đang chờ</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">{interviewCount}</div>
                        <div className="text-sm text-muted-foreground">Phỏng vấn</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">{acceptedCount}</div>
                        <div className="text-sm text-muted-foreground">Đã trúng tuyển</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Apps */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Đơn ứng tuyển gần đây</CardTitle>
                        <Link href="/dashboard/applications" className="text-sm text-blue-600 hover:underline flex items-center">
                            Xem tất cả <ChevronRight className="h-4 w-4" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {applications.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Bạn chưa ứng tuyển công việc nào.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applications.slice(0, 4).map((app: any) => (
                                    <div key={app._id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                                <Briefcase className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{app.jobTitle}</div>
                                                <div className="text-xs text-muted-foreground">{app.companyName}</div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`${statusColors[app.status || 'new']} border-0`}>
                                            {statusLabels[app.status || 'new']}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Suggested Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lời khuyên</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            <p className="text-sm text-muted-foreground">Hoàn thiện 100% hồ sơ để nhà tuyển dụng chú ý hơn.</p>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            <p className="text-sm text-muted-foreground">Bật thông báo email để không bỏ lỡ lịch phỏng vấn.</p>
                        </div>
                        <div className="flex gap-3">
                            <Briefcase className="h-5 w-5 text-blue-500 shrink-0" />
                            <p className="text-sm text-muted-foreground">Tham khảo các việc làm "Hot" trong tuần này.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
