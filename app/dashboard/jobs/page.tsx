"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Loader2 } from "lucide-react"

// Types matching API response
type Job = {
    _id: string
    title: string
    company: string
    status: "active" | "closed" | "pending" | "rejected" | "request_changes"
    postedAt: string
    type: string
    salary: string
    creatorId?: string
}

export default function AdminJobsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
    const [feedback, setFeedback] = useState("")
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading) {
            if (user?.role !== 'admin') {
                router.push('/dashboard')
                return
            }
            fetchJobs()
        }
    }, [user, authLoading, router])

    const fetchJobs = async () => {
        try {
            // Fetch all jobs including pending/rejected
            const response = await fetch('/api/jobs?status=all')
            const data = await response.json()
            if (data.success) {
                setJobs(data.data.jobs)
            }
        } catch (error) {
            console.error("Failed to fetch jobs", error)
            toast({
                title: "Lỗi tải dữ liệu",
                description: "Không thể lấy danh sách tin tuyển dụng",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (id: string, newStatus: string, adminFeedback: string = "") => {
        try {
            const response = await fetch(`/api/jobs/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, feedback: adminFeedback })
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Cập nhật thành công",
                    description: `Trạng thái tin tuyển dụng đã được cập nhật thành: ${newStatus}`,
                })
                // Refresh list locally
                setJobs(prev => prev.map(job =>
                    job._id === id ? { ...job, status: newStatus as any } : job
                ))
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            toast({
                title: "Lỗi cập nhật",
                description: "Không thể cập nhật trạng thái.",
                variant: "destructive"
            })
        }
    }

    const confirmReject = () => {
        if (selectedJobId) {
            handleStatusUpdate(selectedJobId, "rejected", feedback)
            setRejectDialogOpen(false)
            setFeedback("")
            setSelectedJobId(null)
        }
    }

    const openRejectDialog = (id: string) => {
        setSelectedJobId(id)
        setRejectDialogOpen(true)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Đã duyệt</Badge>
            case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Chờ duyệt</Badge>
            case 'rejected': return <Badge variant="destructive">Từ chối</Badge>
            case 'request_changes': return <Badge variant="outline" className="text-orange-600 border-orange-600">Cần sửa</Badge>
            case 'closed': return <Badge variant="secondary">Đã đóng</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    if (authLoading || isLoading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý tin tuyển dụng</h1>
                    <p className="text-muted-foreground">Dyệt và quản lý các bài đăng tuyển dụng từ doanh nghiệp.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách bài đăng</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ngày đăng</TableHead>
                                <TableHead>Vị trí</TableHead>
                                <TableHead>Công ty</TableHead>
                                <TableHead>Mức lương</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Chưa có tin tuyển dụng nào.</TableCell>
                                </TableRow>
                            ) : (
                                jobs.map((job) => (
                                    <TableRow key={job._id}>
                                        <TableCell>{new Date(job.postedAt).toLocaleDateString("vi-VN")}</TableCell>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{job.company}</TableCell>
                                        <TableCell>{job.salary}</TableCell>
                                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {job.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 h-8"
                                                            onClick={() => handleStatusUpdate(job._id, "active")}
                                                            title="Duyệt bài"
                                                        >
                                                            <Check className="h-4 w-4 mr-1" /> Duyệt
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8"
                                                            onClick={() => openRejectDialog(job._id)}
                                                            title="Từ chối"
                                                        >
                                                            <X className="h-4 w-4 mr-1" /> Từ chối
                                                        </Button>
                                                    </>
                                                )}

                                                {job.status === 'active' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                                                        onClick={() => openRejectDialog(job._id)}
                                                    >
                                                        Gỡ bài
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Từ chối / Gỡ bài tuyển dụng</DialogTitle>
                        <DialogDescription>
                            Vui lòng nhập lý do từ chối để nhà tuyển dụng biết và chỉnh sửa (nếu cần).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Nhập lý do tại đây..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={confirmReject}>Xác nhận từ chối</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
