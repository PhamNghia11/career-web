"use client"
// Deployment trigger: fixed linking issues

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Eye, FileText, Users } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
    DialogHeader,
    DialogTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"



function JobActions({ job, setJobToDelete, setDeleteDialogOpen }: { job: any, setJobToDelete: (id: string) => void, setDeleteDialogOpen: (open: boolean) => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <Link href={`/jobs/${job._id}`} target="_blank">
                    <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                    </DropdownMenuItem>
                </Link>
                <Link href={`/dashboard/applicants-manager?jobId=${job._id}`}>
                    <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> Xem ứng viên
                    </DropdownMenuItem>
                </Link>
                <Link href={`/dashboard/jobs/${job._id}/edit`}>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    className="text-destructive font-medium"
                    onClick={() => {
                        setJobToDelete(job._id)
                        setDeleteDialogOpen(true)
                    }}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa tin
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function MyJobsPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    // Delete Dialog logic
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<string | null>(null)

    useEffect(() => {
        fetchJobs()
    }, [user?._id])

    const fetchJobs = async () => {
        if (!user?._id) return
        try {
            setLoading(true)
            const res = await fetch(`/api/jobs?creatorId=${user._id}`)
            const data = await res.json()
            if (data.success) {
                setJobs(data.data.jobs || [])
            }
        } catch (error) {
            console.error("Failed to fetch jobs", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteJob = async () => {
        if (!jobToDelete) return

        try {
            const response = await fetch(`/api/jobs/${jobToDelete}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                toast({ title: "Xóa thành công", description: "Tin tuyển dụng đã được xóa." })
                setJobs(prev => prev.filter(job => job._id !== jobToDelete))
            } else {
                throw new Error(data.error)
            }
        } catch (e) {
            toast({ title: "Lỗi", description: "Không thể xóa tin.", variant: "destructive" })
        } finally {
            setDeleteDialogOpen(false)
            setJobToDelete(null)
        }
    }

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-foreground">
                        Quản lý tin đăng
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý tất cả các vị trí bạn đã đăng tuyển
                    </p>
                </div>
                <Link href="/dashboard/jobs/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Đăng tin mới
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo tiêu đề..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hiển thị</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="closed">Đã đóng</option>
                                <option value="rejected">Bị từ chối</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="hidden md:table-header-group">
                                <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Vị trí tuyển dụng</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Trạng thái</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-1/4 whitespace-nowrap">Phản hồi</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Ứng viên</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Ngày đăng</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground whitespace-nowrap">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Đang tải dữ liệu...</td></tr>
                                ) : filteredJobs.length === 0 ? (
                                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Không tìm thấy tin đăng nào.</td></tr>
                                ) : (
                                    filteredJobs.map((job) => (
                                        <>
                                            {/* Desktop Row */}
                                            <tr key={`${job._id}-desktop`} className="hidden md:table-row border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium">
                                                    <div className="font-semibold line-clamp-1">{job.title}</div>
                                                    <div className="text-xs text-muted-foreground">{job.location} • {job.type}</div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge variant={job.status === 'active' ? 'default' : job.status === 'pending' ? 'secondary' : job.status === 'closed' ? 'outline' : 'destructive'}>
                                                        {job.status === 'active' ? 'Hoạt động' : job.status === 'pending' ? 'Chờ duyệt' : job.status === 'closed' ? 'Đã đóng' : 'Từ chối'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle text-sm">
                                                    {(job.status === 'rejected' || job.status === 'request_changes') && job.adminFeedback ? (
                                                        <span className="text-destructive font-medium line-clamp-2">{job.adminFeedback}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span>{job.applicants || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground whitespace-nowrap">
                                                    {new Date(job.postedAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <JobActions job={job} setJobToDelete={setJobToDelete} setDeleteDialogOpen={setDeleteDialogOpen} />
                                                </td>
                                            </tr>

                                            {/* Mobile Card Layout */}
                                            <tr key={`${job._id}-mobile`} className="md:hidden border-b">
                                                <td colSpan={6} className="p-4">
                                                    <div className="space-y-4">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-base text-gray-900 leading-tight mb-1">
                                                                    {job.title}
                                                                </h3>
                                                                <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground font-medium">
                                                                    <span>{job.location}</span>
                                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                                    <span>{job.type}</span>
                                                                </div>
                                                            </div>
                                                            <div className="shrink-0">
                                                                <JobActions job={job} setJobToDelete={setJobToDelete} setDeleteDialogOpen={setDeleteDialogOpen} />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-2 pt-2">
                                                            <Badge variant={job.status === 'active' ? 'default' : job.status === 'pending' ? 'secondary' : job.status === 'closed' ? 'outline' : 'destructive'} className="text-[10px] px-2 py-0.5">
                                                                {job.status === 'active' ? 'Hoạt động' : job.status === 'pending' ? 'Chờ duyệt' : job.status === 'closed' ? 'Đã đóng' : 'Từ chối'}
                                                            </Badge>
                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                                                <div className="flex items-center gap-1">
                                                                    <Users className="h-3.5 w-3.5" />
                                                                    <span>{job.applicants || 0} ứng viên</span>
                                                                </div>
                                                                <span>{new Date(job.postedAt).toLocaleDateString('vi-VN')}</span>
                                                            </div>
                                                        </div>

                                                        {(job.status === 'rejected' || job.status === 'request_changes') && job.adminFeedback && (
                                                            <div className="mt-2 p-2 bg-destructive/5 rounded text-xs text-destructive font-medium border border-destructive/10">
                                                                Phản hồi: {job.adminFeedback}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa tin tuyển dụng?</DialogTitle>
                        <DialogDescription>
                            Tin này sẽ bị xóa khỏi hệ thống và không thể khôi phục.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDeleteJob}>Xóa vĩnh viễn</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
