"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    Eye,
    UserCheck,
    Globe,
    Monitor,
    Smartphone,
    RefreshCw,
    Calendar,
    Download,
    Trash2,
    AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Visitor {
    _id: string
    ip: string
    userAgent: string
    page: string
    referrer?: string
    userId?: string
    userName?: string
    visitedAt: string
    device?: string
}

interface Stats {
    totalVisitors: number
    todayVisitors: number
    uniqueVisitors: number
    loggedInUsers: number
    topPages: { page: string; count: number }[]
}

export default function VisitorsPage() {
    const [visitors, setVisitors] = useState<Visitor[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [days, setDays] = useState(7)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const { toast } = useToast()
    const [exporting, setExporting] = useState(false)
    const [cleaning, setCleaning] = useState(false)
    const [cleanupDays, setCleanupDays] = useState(90)
    const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false)

    const fetchVisitors = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/visitors?days=${days}&page=${page}&limit=20`)
            const data = await response.json()

            if (data.success) {
                setVisitors(data.data)
                setStats(data.stats)
                setTotalPages(data.pagination.totalPages)
            }
        } catch (error) {
            console.error("Error fetching visitors:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVisitors()
    }, [days, page])

    const handleExport = async () => {
        try {
            setExporting(true)
            const response = await fetch(`/api/visitors?days=${days}&download=true`)
            const data = await response.json()

            if (data.success && data.data) {
                const headers = ["ID", "IP", "Trang", "Thiết bị", "Người dùng", "Thời gian"]
                const rows = data.data.map((v: Visitor) => [
                    v._id,
                    v.ip,
                    v.page,
                    v.device || "Unknown",
                    v.userName || "Khách",
                    new Date(v.visitedAt).toLocaleString("vi-VN")
                ])

                const csvContent = [
                    headers.join(","),
                    ...rows.map((r: any[]) => r.map(cell => `"${cell}"`).join(","))
                ].join("\n")

                const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.setAttribute("href", url)
                link.setAttribute("download", `visitors_data_${days}days_${new Date().toLocaleDateString()}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                toast({
                    title: "Xuất dữ liệu thành công",
                    description: `Đã tải xuống dữ liệu của ${days} ngày qua.`
                })
            }
        } catch (error) {
            console.error("Export error:", error)
            toast({
                title: "Lỗi",
                description: "Không thể xuất dữ liệu.",
                variant: "destructive"
            })
        } finally {
            setExporting(false)
        }
    }

    const handleCleanup = async () => {
        try {
            setCleaning(true)
            const response = await fetch(`/api/visitors?days=${cleanupDays}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Dọn dẹp thành công",
                    description: data.message
                })
                fetchVisitors()
                setCleanupDialogOpen(false)
            }
        } catch (error) {
            console.error("Cleanup error:", error)
            toast({
                title: "Lỗi",
                description: "Không thể dọn dẹp dữ liệu.",
                variant: "destructive"
            })
        } finally {
            setCleaning(false)
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getDeviceIcon = (device?: string) => {
        if (!device) return <Globe className="h-4 w-4" />
        if (device.includes("Mobile")) return <Smartphone className="h-4 w-4" />
        return <Monitor className="h-4 w-4" />
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Khách truy cập</h1>
                    <p className="text-muted-foreground">
                        Theo dõi lượt truy cập website
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={days}
                        onChange={(e) => {
                            setDays(Number(e.target.value))
                            setPage(1)
                        }}
                        className="px-3 py-2 border rounded-md text-sm"
                    >
                        <option value={1}>Hôm nay</option>
                        <option value={7}>7 ngày</option>
                        <option value={30}>30 ngày</option>
                        <option value={90}>90 ngày</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || loading}>
                        <Download className="h-4 w-4 mr-2" />
                        Xuất CSV
                    </Button>
                    <Dialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Dọn dẹp
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Dọn dẹp dữ liệu cũ</DialogTitle>
                                <DialogDescription>
                                    Hành động này sẽ xóa các bản ghi lịch sử truy cập để giải phóng dung lượng.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                                    <AlertTriangle className="h-5 w-5 shrink-0" />
                                    <span>Nên xuất dữ liệu CSV trước khi xóa để lưu trữ.</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Giữ lại dữ liệu trong vòng:</label>
                                    <select
                                        value={cleanupDays}
                                        onChange={(e) => setCleanupDays(Number(e.target.value))}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value={30}>30 ngày gần đây</option>
                                        <option value={60}>60 ngày gần đây</option>
                                        <option value={90}>90 ngày gần đây</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">Các bản ghi cũ hơn mốc này sẽ bị xóa vĩnh viễn.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCleanupDialogOpen(false)}>Hủy</Button>
                                <Button variant="destructive" onClick={handleCleanup} disabled={cleaning}>
                                    {cleaning ? "Đang xóa..." : "Xác nhận xóa"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={fetchVisitors} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng lượt truy cập</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalVisitors || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Trong {days} ngày qua
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lượt truy cập hôm nay</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.todayVisitors || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Từ 00:00 đến hiện tại
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Khách unique (IP)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats?.uniqueVisitors || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Địa chỉ IP khác nhau
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã đăng nhập</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{stats?.loggedInUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Users có tài khoản
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Pages */}
            {stats?.topPages && stats.topPages.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Trang được xem nhiều nhất</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {stats.topPages.map((p, index) => (
                                <Badge key={index} variant="secondary" className="text-sm">
                                    {p.page} ({p.count})
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Visitors Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết lượt truy cập</CardTitle>
                    <CardDescription>
                        Danh sách các lượt truy cập gần đây
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                    ) : visitors.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Chưa có lượt truy cập nào trong khoảng thời gian này
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Thời gian</TableHead>
                                        <TableHead>Trang</TableHead>
                                        <TableHead>Thiết bị</TableHead>
                                        <TableHead>Người dùng</TableHead>
                                        <TableHead>IP</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visitors.map((visitor) => (
                                        <TableRow key={visitor._id}>
                                            <TableCell className="text-sm">
                                                {formatTime(visitor.visitedAt)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {visitor.page}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getDeviceIcon(visitor.device)}
                                                    <span className="text-sm text-muted-foreground">
                                                        {visitor.device || "Unknown"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {visitor.userName ? (
                                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                                        {visitor.userName}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Khách</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {visitor.ip}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Trước
                                    </Button>
                                    <span className="px-3 py-2 text-sm">
                                        Trang {page} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
