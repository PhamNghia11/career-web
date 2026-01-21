"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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

export default function ManageApplicationsPage() {
    const router = useRouter()
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

    // Deep linking: Check for 'id' in URL and auto-open that application
    useEffect(() => {
        const idFromUrl = searchParams.get("id")
        if (idFromUrl && applications.length > 0) {
            const targetApp = applications.find(app => app._id === idFromUrl)
            if (targetApp) {
                console.log("Deep linking to application:", idFromUrl)
                handleViewCV(targetApp)
            }
        }
    }, [searchParams, applications])

    const fetchApplications = async () => {
        try {
            const role = user?.role || "student"
            const queryParams = new URLSearchParams()
            queryParams.set("role", role)

            if (role === "student") {
                // Students shouldn't really be here, but if they are, show nothing or their Own
                queryParams.set("email", user?.email || "")
            } else if (role === "employer") {
                queryParams.set("employerId", user?.id || "")
            }

            console.log("Fetching applications with params:", queryParams.toString())

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

    const handleStatusChange = async (appId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/applications/${appId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    updaterId: user?.id,
                    updaterRole: user?.role
                })
            })

            if (res.ok) {
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
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to update status")
            }
        } catch (error: any) {
            toast({
                title: "Lỗi",
                description: error.message || "Không thể cập nhật trạng thái",
                variant: "destructive"
            })
        }
    }

    // Security: Only Admin and Employer can manage applications
    // If user is not logged in, redirect to login
    useEffect(() => {
        if (!isLoading && !user) {
            const returnUrl = encodeURIComponent(`/dashboard/applicants-manager?${searchParams.toString()}`)
            router.push(`/login?returnUrl=${returnUrl}`)
        }
    }, [user, isLoading, router, searchParams])

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect
    }

    if (user.role === 'student') {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <main className="flex-1 container mx-auto px-4 py-8">
                    <Card className="p-12 text-center">
                        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold">Khu vực dành cho Nhà tuyển dụng</h2>
                        <p className="text-gray-500 mt-2">
                            Tài khoản hiện tại của bạn là <strong>Sinh viên</strong> ({user.email}).<br />
                            Vui lòng đăng xuất và đăng nhập bằng tài khoản <strong>Nhà tuyển dụng</strong> để xem hồ sơ ứng tuyển.
                        </p>
                        <Button
                            className="mt-6"
                            variant="outline"
                            onClick={() => router.push('/login')}
                        >
                            Đăng nhập tài khoản khác
                        </Button>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý ứng tuyển</h1>
                        <p className="text-muted-foreground mt-2">
                            Quản lý hồ sơ ứng viên cho các vị trí tuyển dụng
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách hồ sơ ({applications.length})</CardTitle>
                        <CardDescription>
                            Danh sách ứng viên nộp hồ sơ vào các vị trí của bạn
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {applications.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có ứng viên</h3>
                                <p className="text-gray-500">Chưa có ứng viên nào nộp hồ sơ vào các vị trí của bạn.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-1 sm:mx-0">
                                {/* Desktop Table View */}
                                <Table className="hidden lg:table">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Vị trí</TableHead>
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
                                                    <Select
                                                        value={app.status}
                                                        onValueChange={(value) => handleStatusChange(app._id, value)}
                                                        disabled={user?.role === 'employer' && app.employerId !== user?.id}
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
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleViewCV(app)}>
                                                        <Eye className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Mobile Card View */}
                                <div className="grid grid-cols-1 gap-4 lg:hidden">
                                    {applications.map((app) => (
                                        <div key={app._id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-blue-900 truncate pr-2">{app.jobTitle}</h3>
                                                    <p className="text-xs text-gray-500 truncate">{app.companyName}</p>
                                                </div>
                                                {getStatusBadge(app.status)}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm py-3 border-y border-gray-50">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Ứng viên</p>
                                                    <p className="font-semibold text-gray-900 truncate">{app.fullname}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Ngày nộp</p>
                                                    <p className="font-medium text-gray-700">{new Date(app.createdAt).toLocaleDateString("vi-VN")}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <span className="truncate">{app.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    <span>{app.phone}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 font-bold text-blue-600 border-blue-100 bg-blue-50/50"
                                                    onClick={() => handleViewCV(app)}
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Xem CV/Chi tiết
                                                </Button>
                                                <Select
                                                    value={app.status}
                                                    onValueChange={(value) => handleStatusChange(app._id, value)}
                                                    disabled={user?.role === 'employer' && app.employerId !== user?.id}
                                                >
                                                    <SelectTrigger className="flex-1 h-9">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="new">Mới</SelectItem>
                                                        <SelectItem value="reviewed">Đã xem</SelectItem>
                                                        <SelectItem value="interviewed">Mời PV</SelectItem>
                                                        <SelectItem value="hired">Đã tuyển</SelectItem>
                                                        <SelectItem value="rejected">Từ chối</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
                <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[90vh] flex flex-col p-4 sm:p-6 rounded-2xl sm:rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="text-base sm:text-lg truncate">CV: {selectedApp?.fullname}</span>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className="hidden sm:inline-flex">{selectedApp?.jobTitle}</Badge>
                                <Button variant="outline" size="sm" onClick={() => selectedApp && handleViewCV(selectedApp)} className="h-8">
                                    Tải lại
                                </Button>
                            </div>
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
