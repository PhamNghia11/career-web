"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Simple Jobs Page for Admin
export default function JobsPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [jobs, setJobs] = useState<any[]>([])
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        if (!isLoading) {
            if (!user || user.role !== "admin") {
                router.push("/dashboard")
                return
            }
            fetchJobs()
        }
    }, [user, isLoading, router])

    const fetchJobs = async () => {
        try {
            const res = await fetch("/api/jobs")
            const response = await res.json()
            if (response.success) {
                // Should return { success: true, data: { jobs: [], total: ... } }
                const jobsList = response.data.jobs || []
                setJobs(jobsList)
            }
        } catch (error) {
            console.error("Failed to fetch jobs", error)
        } finally {
            setLoadingData(false)
        }
    }

    if (isLoading || loadingData) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
    }

    if (!user || user.role !== "admin") return null

    return (
        <div className="space-y-6 max-w-6xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Quản lý việc làm</h2>
                <p className="text-muted-foreground">Danh sách tất cả việc làm trên hệ thống ({jobs.length})</p>
            </div>

            <div className="grid gap-4">
                {jobs.map((job) => (
                    <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row gap-4 p-6">
                                <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    {job.logo ? (
                                        <img src={job.logo} alt={job.company} className="h-12 w-12 object-contain" />
                                    ) : (
                                        <Briefcase className="h-8 w-8 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-semibold text-lg hover:text-primary cursor-pointer truncate">
                                                {job.title}
                                            </h3>
                                            <p className="text-muted-foreground font-medium">{job.company}</p>
                                        </div>
                                        <Badge variant={job.status === "active" ? "default" : "secondary"}>
                                            {job.status === "active" ? "Đang tuyển" : "Đã đóng"}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            <span>{job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign className="h-4 w-4" />
                                            <span>{job.salary}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex md:flex-col gap-2 justify-center">
                                    <Button variant="outline" size="sm">Chỉnh sửa</Button>
                                    <Button variant="destructive" size="sm">Xóa</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
