"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Eye, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function EmployerDashboardContent() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        activeJobs: 0,
        pendingJobs: 0,
        totalApplications: 0, // Mock for now or fetch if API exists
        totalViews: 0
    })
    const [recentJobs, setRecentJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!user?._id) return

            try {
                setLoading(true)
                // Fetch jobs created by this employer
                const res = await fetch(`/api/jobs?creatorId=${user._id}`)
                const data = await res.json()

                if (data.success) {
                    const jobs = data.data.jobs || []

                    // Calculate stats
                    const active = jobs.filter((j: any) => j.status === 'active').length
                    const pending = jobs.filter((j: any) => j.status === 'pending').length
                    const views = jobs.reduce((acc: number, j: any) => acc + (j.views || 0), 0)
                    const applications = jobs.reduce((acc: number, j: any) => acc + (j.applicants || 0), 0)

                    setStats({
                        activeJobs: active,
                        pendingJobs: pending,
                        totalApplications: applications,
                        totalViews: views
                    })

                    setRecentJobs(jobs.slice(0, 5)) // Get top 5 recent
                }
            } catch (error) {
                console.error("Failed to fetch employer dashboard data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user?._id])

    if (loading) {
        return <div className="text-center py-8">Đang tải dữ liệu...</div>
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tin đang đăng</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeJobs}</div>
                        <p className="text-xs text-muted-foreground">
                            + {stats.pendingJobs} tin đang chờ duyệt
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đơn ứng tuyển</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">
                            Tổng số CV đã nhận
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lượt xem tin</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalViews}</div>
                        <p className="text-xs text-muted-foreground">
                            Tổng lượt xem tất cả tin
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ứng viên tiềm năng</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Tính năng đang phát triển
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Action Banner */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <div>
                    <h3 className="text-lg font-semibold text-primary">Đăng tin tuyển dụng mới?</h3>
                    <p className="text-sm text-muted-foreground">Tiếp cận hàng nghìn sinh viên tiềm năng ngay hôm nay.</p>
                </div>
                <Link href="/dashboard/jobs/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Đăng tin ngay
                    </Button>
                </Link>
            </div>

            {/* Recent Jobs List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Tin tuyển dụng gần đây</CardTitle>
                    <Link href="/dashboard/my-jobs">
                        <Button variant="ghost" size="sm" className="text-primary">Xem tất cả <ArrowRight className="ml-1 h-4 w-4" /></Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentJobs.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">Chưa có bài đăng nào.</div>
                    ) : (
                        <div className="space-y-4">
                            {recentJobs.map((job) => (
                                <div key={job._id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold">{job.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>Đăng: {new Date(job.postedAt).toLocaleDateString('vi-VN')}</span>
                                            <span>•</span>
                                            <span>{job.applicants || 0} hồ sơ</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={job.status === 'active' ? 'default' : job.status === 'pending' ? 'secondary' : 'destructive'}>
                                            {job.status === 'active' ? 'Đang hiển thị' : job.status === 'pending' ? 'Chờ duyệt' : 'Đã đóng/Từ chối'}
                                        </Badge>
                                        <Link href={`/dashboard/jobs/${job._id}/edit`}>
                                            <Button variant="outline" size="sm">Sửa</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
