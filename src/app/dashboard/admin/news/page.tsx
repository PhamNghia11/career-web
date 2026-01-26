"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Newspaper, TrendingUp, Calendar, Eye, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { News } from "@/types"

const CATEGORIES = ["Thị trường", "Công nghệ", "Việc làm", "Kỹ năng", "Cẩm nang", "Định hướng", "Góc nhìn", "Thông báo", "Video", "Quote"]

export default function AdminNewsPage() {
    const [news, setNews] = useState<News[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentNews, setCurrentNews] = useState<Partial<News>>({
        title: "",
        summary: "",
        content: "",
        category: CATEGORIES[0],
        sourceName: "GDU Research",
        sourceUrl: "#",
        imageUrl: "",
        gallery: [],
        videoUrls: [],
        relatedLinks: [],
        tags: [],
        isFeatured: false,
    })
    const { toast } = useToast()

    // Helper to add/remove items from arrays
    const handleArrayChange = (field: keyof News, index: number, value: string) => {
        const arr = [...(currentNews[field] as any[])]
        arr[index] = value
        setCurrentNews({ ...currentNews, [field]: arr })
    }

    const addItem = (field: keyof News, defaultValue: any = "") => {
        const arr = [...(currentNews[field] as any[] || []), defaultValue]
        setCurrentNews({ ...currentNews, [field]: arr })
    }

    const removeItem = (field: keyof News, index: number) => {
        const arr = [...(currentNews[field] as any[])]
        arr.splice(index, 1)
        setCurrentNews({ ...currentNews, [field]: arr })
    }

    const handleLinkChange = (index: number, field: "title" | "url", value: string) => {
        const links = [...(currentNews.relatedLinks || [])]
        links[index] = { ...links[index], [field]: value }
        setCurrentNews({ ...currentNews, relatedLinks: links })
    }

    const fetchNews = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/news?limit=100")
            const result = await res.json()
            if (result.success) {
                setNews(result.data)
            }
        } catch (error) {
            console.error("Fetch news error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNews()
    }, [])

    const handleSave = async () => {
        if (!currentNews.title || !currentNews.summary || !currentNews.content) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng điền các trường bắt buộc", variant: "destructive" })
            return
        }

        try {
            const method = isEditing ? "PATCH" : "POST"
            const res = await fetch("/api/news", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentNews),
            })

            const result = await res.json()
            if (result.success) {
                toast({ title: isEditing ? "Cập nhật thành công" : "Đăng tin thành công" })
                setIsDialogOpen(false)
                fetchNews()
                setCurrentNews({
                    title: "",
                    summary: "",
                    content: "",
                    category: CATEGORIES[0],
                    sourceName: "GDU Research",
                    sourceUrl: "#",
                    imageUrl: "",
                })
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể lưu bài viết", variant: "destructive" })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return

        try {
            const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast({ title: "Đã xóa tin tức" })
                fetchNews()
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể xóa bài viết", variant: "destructive" })
        }
    }

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sourceName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight">Hệ thống Quản lý Tin tức</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Đăng tải và điều phối các bài phân tích, xu hướng thị trường lao động cho sinh viên.</p>
                </div>
                <Button onClick={() => {
                    setIsEditing(false)
                    setCurrentNews({
                        title: "",
                        summary: "",
                        content: "",
                        category: CATEGORIES[0],
                        sourceName: "GDU Research",
                        sourceUrl: "#",
                        imageUrl: "",
                        gallery: [],
                        videoUrls: [],
                        relatedLinks: [],
                        tags: [],
                        isFeatured: false,
                    })
                    setIsDialogOpen(true)
                }} className="h-14 px-8 rounded-2xl gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                    <Plus className="w-5 h-5" /> Đăng bài viết mới
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar/Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-[24px] border-border/40 overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Bộ lọc nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Tìm theo tiêu đề..."
                                    className="pl-9 h-11 rounded-xl bg-muted/20 border-border/40 focus:ring-primary/20"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 pt-2">
                                <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Theo nguồn tin</Label>
                                <div className="grid grid-cols-1 gap-2">
                                    {["VietnamWorks", "TopCV", "GDU Research"].map(s => (
                                        <Button key={s} variant="ghost" className="justify-start gap-2 h-10 rounded-lg font-medium text-sm hover:bg-primary/5 hover:text-primary px-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[24px] border-border/40 overflow-hidden bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-2xl font-black leading-none">{news.length}</div>
                            </div>
                            <div className="text-sm font-bold opacity-80">Tổng số bài viết hiện có trên hệ thống</div>
                        </CardContent>
                    </Card>
                </div>

                {/* News List */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-muted/10 rounded-[40px] border-2 border-dashed border-border/40">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-muted-foreground font-medium">Đang tải danh sách bài viết...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredNews.map((item) => (
                                <Card key={item._id} className="overflow-hidden group flex flex-col rounded-[28px] border-border/40 hover:shadow-xl transition-all duration-300">
                                    <div className="relative h-44 bg-muted overflow-hidden">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Newspaper className="w-16 h-16 text-muted-foreground/20" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[10px] font-black text-white rounded-full uppercase tracking-widest border border-white/10">
                                                {item.category}
                                            </span>
                                        </div>
                                        {/* Quick Actions Overlay */}
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex flex-col gap-2">
                                                <Button size="icon" className="h-8 w-8 rounded-full bg-white text-zinc-900 hover:bg-white/90" onClick={() => {
                                                    setIsEditing(true)
                                                    setCurrentNews(item)
                                                    setIsDialogOpen(true)
                                                }}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleDelete(item._id!)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 flex-grow flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(item.publishedAt).toLocaleDateString("vi-VN")}
                                                </div>
                                                <div className="h-1 w-1 rounded-full bg-border" />
                                                <div className="flex items-center gap-1.5 text-primary">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {item.views} views
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black line-clamp-2 mb-3 leading-tight group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
                                            {item.summary}
                                        </p>
                                        <div className="mt-auto pt-5 border-t border-border/40 flex items-center justify-between">
                                            <div className="px-3 py-1 bg-muted/40 rounded-lg flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {item.sourceName}
                                            </div>
                                            <a href={item.sourceUrl} target="_blank" className="text-[11px] font-black text-primary hover:underline flex items-center gap-1">
                                                Link nguồn <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Post/Edit Dialog - Professional Redesign */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[32px] border-none shadow-2xl">
                    <div className="bg-primary text-white p-8">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <Newspaper className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-tight">{isEditing ? "Hiệu chỉnh bài viết" : "Đăng Tin tức mới"}</DialogTitle>
                                    <DialogDescription className="text-white/80 font-medium pt-1">Nhập thông tin chi tiết về bài phân tích hoặc tin thị trường lao động.</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-zinc-50/50">
                        {/* Section 1: Basic Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[10px]">1</span>
                                Thông tin cơ bản
                            </div>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title" className="font-bold text-zinc-700">Tiêu đề bài viết <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="title"
                                        value={currentNews.title}
                                        onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
                                        placeholder="VD: Xu hướng nhân lực IT 2025..."
                                        className="h-14 rounded-xl border-border/60 focus:ring-primary/20 bg-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label className="font-bold text-zinc-700">Chuyên mục <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={currentNews.category}
                                            onValueChange={(val) => setCurrentNews({ ...currentNews, category: val })}
                                        >
                                            <SelectTrigger className="h-14 rounded-xl border-border/60 bg-white">
                                                <SelectValue placeholder="Chọn chuyên mục" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border/40">
                                                {CATEGORIES.map(c => <SelectItem key={c} value={c} className="py-3 font-medium">{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="source" className="font-bold text-zinc-700">Tên Nguồn tin <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="source"
                                            value={currentNews.sourceName}
                                            onChange={(e) => setCurrentNews({ ...currentNews, sourceName: e.target.value })}
                                            placeholder="VD: VietnamWorks, ITviec..."
                                            className="h-14 rounded-xl border-border/60 focus:ring-primary/20 bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10 mt-4">
                                    <div className="space-y-0.5">
                                        <Label className="font-bold text-primary">Bài viết nổi bật (Featured)</Label>
                                        <p className="text-xs text-muted-foreground font-medium">Hiển thị ở khu vực trang trọng nhất trên trang tin tức.</p>
                                    </div>
                                    <Switch
                                        checked={currentNews.isFeatured}
                                        onCheckedChange={(val) => setCurrentNews({ ...currentNews, isFeatured: val })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Links & Media */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[10px]">2</span>
                                Nguồn & Hình ảnh
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="sourceUrl" className="font-bold text-zinc-700 flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" /> Link nguồn bài viết
                                    </Label>
                                    <Input
                                        id="sourceUrl"
                                        value={currentNews.sourceUrl}
                                        onChange={(e) => setCurrentNews({ ...currentNews, sourceUrl: e.target.value })}
                                        placeholder="https://vietnamworks.com/article/..."
                                        className="h-14 rounded-xl border-border/60 focus:ring-primary/20 bg-white"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="imageUrl" className="font-bold text-zinc-700 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-muted-foreground" /> Link hình ảnh đại diện (Thumbnail)
                                    </Label>
                                    <Input
                                        id="imageUrl"
                                        value={currentNews.imageUrl}
                                        onChange={(e) => setCurrentNews({ ...currentNews, imageUrl: e.target.value })}
                                        placeholder="Link ảnh chính..."
                                        className="h-14 rounded-xl border-border/60 focus:ring-primary/20 bg-white"
                                    />
                                </div>

                                <Separator className="my-2" />

                                {/* Gallery Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-bold text-zinc-700">Bộ sưu tập ảnh (Gallery)</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => addItem('gallery')} className="h-8 gap-1">
                                            <Plus className="w-3 h-3" /> Thêm ảnh
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {currentNews.gallery?.map((url, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <Input
                                                    value={url}
                                                    onChange={(e) => handleArrayChange('gallery', idx, e.target.value)}
                                                    placeholder="Link ảnh bổ sung..."
                                                    className="h-10 rounded-lg"
                                                />
                                                <Button size="icon" variant="ghost" onClick={() => removeItem('gallery', idx)} className="text-red-500 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="my-2" />

                                {/* Videos Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-bold text-zinc-700">Danh sách Videos (URL)</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => addItem('videoUrls')} className="h-8 gap-1">
                                            <Plus className="w-3 h-3" /> Thêm video
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {currentNews.videoUrls?.map((url, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <Input
                                                    value={url}
                                                    onChange={(e) => handleArrayChange('videoUrls', idx, e.target.value)}
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    className="h-10 rounded-lg"
                                                />
                                                <Button size="icon" variant="ghost" onClick={() => removeItem('videoUrls', idx)} className="text-red-500 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="my-2" />

                                {/* Related Links Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-bold text-zinc-700">Liên kết liên quan (Related Links)</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => addItem('relatedLinks', { title: "", url: "" })} className="h-8 gap-1">
                                            <Plus className="w-3 h-3" /> Thêm link
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {currentNews.relatedLinks?.map((link, idx) => (
                                            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-xl relative border border-border/20">
                                                <Input
                                                    value={link.title}
                                                    onChange={(e) => handleLinkChange(idx, 'title', e.target.value)}
                                                    placeholder="Tên liên kết (VD: Báo cáo chi tiết)"
                                                    className="h-9 text-xs"
                                                />
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={link.url}
                                                        onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                                                        placeholder="URL liên kết"
                                                        className="h-9 text-xs"
                                                    />
                                                    <Button size="icon" variant="ghost" onClick={() => removeItem('relatedLinks', idx)} className="h-9 w-9 text-red-500 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Content */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[10px]">3</span>
                                Nội dung chi tiết
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="summary" className="font-bold text-zinc-700">Tóm tắt ngắn (Lôi cuốn)</Label>
                                    <Textarea
                                        id="summary"
                                        value={currentNews.summary}
                                        onChange={(e) => setCurrentNews({ ...currentNews, summary: e.target.value })}
                                        placeholder="Viết một đoạn ngắn giới thiệu nội dung (2-3 câu)..."
                                        className="min-h-[100px] rounded-xl border-border/60 focus:ring-primary/20 bg-white p-4 resize-none"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="content" className="font-bold text-zinc-700">Nội dung bài viết (Markdown hoặc Text)</Label>
                                    <Textarea
                                        id="content"
                                        value={currentNews.content}
                                        onChange={(e) => setCurrentNews({ ...currentNews, content: e.target.value })}
                                        placeholder="Viết nội dung đầy đủ của bản tin/phân tích..."
                                        className="min-h-[250px] rounded-xl border-border/60 focus:ring-primary/20 bg-white p-4 resize-y"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border-t border-border/40 flex items-center justify-end gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-14 px-8 rounded-xl font-bold">Hủy bỏ</Button>
                        <Button onClick={handleSave} className="h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-xl shadow-primary/20">
                            {isEditing ? "Cập nhật bài viết" : "Xuất bản bài viết"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
