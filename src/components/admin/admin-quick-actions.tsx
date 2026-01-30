"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
    Plus,
    Zap,
    LayoutDashboard,
    Newspaper,
    Briefcase,
    Loader2,
    X,
    ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function AdminQuickActions() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isQuickNewsOpen, setIsQuickNewsOpen] = useState(false)
    const [quickUrl, setQuickUrl] = useState("")
    const [isFetching, setIsFetching] = useState(false)

    if (!user || user.role !== "admin") return null

    const handleQuickNews = async () => {
        if (!quickUrl) {
            toast({ title: "Thiếu URL", description: "Vui lòng nhập link bài báo", variant: "destructive" })
            return
        }

        setIsFetching(true)
        try {
            const res = await fetch("/api/news/metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: quickUrl }),
            })
            const result = await res.json()

            if (result.success) {
                // Store metadata in session storage to pass it to the news management page
                sessionStorage.setItem("quick_post_metadata", JSON.stringify({
                    ...result.data,
                    sourceUrl: quickUrl
                }))
                setIsQuickNewsOpen(false)
                setQuickUrl("")
                router.push("/dashboard/admin/news")
                toast({ title: "Đang chuyển hướng...", description: "Hệ thống đang mở trang đăng tin với thông tin đã lấy được." })
            } else {
                toast({ title: "Lỗi", description: result.error || "Không thể lấy thông tin", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
        } finally {
            setIsFetching(false)
        }
    }

    return (
        <div className="fixed bottom-32 right-8 z-[100] group">
            <DropdownMenu onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        className={`h-14 px-6 rounded-2xl shadow-2xl transition-all duration-300 bg-[#0A2647] hover:bg-[#0A2647]/90 active:scale-95 flex items-center gap-3 border border-white/20`}
                    >
                        <div className={`transition-transform duration-300 ${isMenuOpen ? "rotate-45" : ""}`}>
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-white tracking-wide">POST MENU</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="mb-4 w-64 rounded-2xl p-3 shadow-2xl border-slate-200">
                    <div className="px-3 py-2 mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#0A2647]">Admin Quick Actions</p>
                    </div>
                    <DropdownMenuItem
                        onClick={() => setIsQuickNewsOpen(true)}
                        className="rounded-xl p-3 cursor-pointer hover:bg-yellow-50 focus:bg-yellow-50 group/item"
                    >
                        <Zap className="w-5 h-5 mr-3 text-yellow-500 fill-yellow-500" />
                        <div>
                            <p className="font-bold text-slate-900 group-hover/item:text-yellow-700 transition-colors">Quick Post News</p>
                            <p className="text-[10px] text-slate-500 font-medium">Auto-fill via URL</p>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => router.push("/dashboard/jobs/new")}
                        className="rounded-xl p-3 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 group/item"
                    >
                        <Briefcase className="w-5 h-5 mr-3 text-blue-600" />
                        <div>
                            <p className="font-bold text-slate-900 group-hover/item:text-blue-700 transition-colors">Đăng việc làm</p>
                            <p className="text-[10px] text-slate-500 font-medium">Open job creation form</p>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-2" />

                    <DropdownMenuItem
                        onClick={() => router.push("/dashboard")}
                        className="rounded-xl p-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 group/item"
                    >
                        <LayoutDashboard className="w-5 h-5 mr-3 text-slate-400" />
                        <span className="font-bold text-slate-700">Dashboard Admin</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick News Modal */}
            <Dialog open={isQuickNewsOpen} onOpenChange={setIsQuickNewsOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-[#0A2647]">Quick Post News</DialogTitle>
                        <DialogDescription className="text-base font-medium">
                            Dán link bài báo vào đây, hệ thống sẽ tự động lấy thông tin cơ bản.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="grid gap-3">
                            <Label htmlFor="global-quick-url" className="text-sm font-bold uppercase tracking-wider text-slate-500">Link bài báo (URL)</Label>
                            <Input
                                id="global-quick-url"
                                placeholder="https://vnexpress.net/..."
                                value={quickUrl}
                                onChange={(e) => setQuickUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleQuickNews()
                                }}
                                className="h-14 rounded-2xl bg-slate-50 border-transparent focus:border-yellow-500 focus:ring-yellow-500/20 text-lg transition-all"
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between gap-4">
                        <Button variant="ghost" onClick={() => setIsQuickNewsOpen(false)} className="rounded-xl px-8 font-bold">Hủy</Button>
                        <Button
                            onClick={handleQuickNews}
                            disabled={isFetching}
                            className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all min-w-[140px]"
                        >
                            {isFetching ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang lấy...
                                </>
                            ) : (
                                "Tiếp tục"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
