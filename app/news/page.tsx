"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { News } from "@/lib/types"
import { NewsCard } from "@/components/home/news-card"
import { TrendingUp, Search, Filter, Newspaper, ArrowRight, ArrowUpRight, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

const CATEGORIES = [
    "Tất cả",
    "Thị trường lao động",
    "Xu hướng công nghệ",
    "Cơ hội việc làm",
    "Kỹ năng mềm",
    "Thông báo GDU"
]

const SOURCES = [
    { name: "VietnamWorks", logo: "https://images.vietnamworks.com/img/logo.png", url: "https://www.vietnamworks.com/" },
    { name: "TopCV", logo: "https://static.topcv.vn/v4/image/logo-v2.png", url: "https://www.topcv.vn/" },
    { name: "ITviec", logo: "https://itviec.com/assets/logo-itviec-449dd542.png", url: "https://itviec.com/" },
    { name: "LinkedIn", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png", url: "https://www.linkedin.com/" },
    { name: "World Bank", logo: "https://www.worldbank.org/content/dam/wbr/logo/logo-wb-header-en.svg", url: "https://www.worldbank.org/" },
    { name: "GDU Research", logo: "/gdu-logo.png", url: "#" }
]

export default function NewsPage() {
    const [news, setNews] = useState<News[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [category, setCategory] = useState("Tất cả")
    const [sortBy, setSortBy] = useState("newest")

    const fetchNews = async () => {
        setLoading(true)
        try {
            const catParam = category !== "Tất cả" ? `&category=${category}` : ""
            const response = await fetch(`/api/news?limit=50${catParam}`)
            const result = await response.json()
            if (result.success) {
                setNews(result.data)
            }
        } catch (error) {
            console.error("Error fetching news:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNews()
    }, [category])

    const filteredAndSortedNews = news
        .filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.summary.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "newest") return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            if (sortBy === "oldest") return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
            if (sortBy === "popular") return b.views - a.views
            return 0
        })

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
            <Header />

            <main className="flex-1">
                {/* Professional & Harmonious Hero Section */}
                <div className="relative py-16 md:py-24 lg:py-28 overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/hero-bg.png')" }}
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-primary/95 lg:bg-primary/90" />

                    <div className="container px-4 mx-auto relative z-10">
                        <div className="max-w-4xl">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                                Tin tức & Phân tích <br />
                                Thị trường Lao động
                            </h1>

                            <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl font-light">
                                Cập nhật xu hướng tuyển dụng, báo cáo thị trường và kiến thức phát triển sự nghiệp từ đội ngũ chuyên gia GDU.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Compact & Integrated Toolbar Section */}
                <div className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-sm bg-white/80">
                    <div className="container px-4 mx-auto py-8">
                        <div className="flex flex-col gap-10">
                            {/* Consolidated Topics - Full Width & Site Font */}
                            <div className="flex flex-nowrap items-center justify-between w-full overflow-x-auto no-scrollbar pb-2 gap-x-4">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`text-[13px] font-black transition-all duration-300 relative py-2 uppercase tracking-widest whitespace-nowrap ${category === cat
                                            ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                                            : "text-slate-400 hover:text-primary"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-2">
                                <div className="relative group max-w-2xl flex-1">
                                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        placeholder="Tìm kiếm nội dung bài viết..."
                                        className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-slate-100 focus:border-primary focus:outline-none text-[15px] transition-all placeholder:text-slate-300"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-slate-200 text-[11px] font-bold text-slate-500 hover:bg-slate-50 hover:text-primary transition-all uppercase tracking-widest">
                                                <TrendingUp className="w-4 h-4" />
                                                SẮP XẾP: {sortBy === "newest" ? "MỚI NHẤT" : sortBy === "popular" ? "THỊNH HÀNH" : "CŨ NHẤT"}
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-48 rounded-xl p-1 shadow-xl border-slate-100" align="end">
                                            <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                                                <DropdownMenuRadioItem value="newest" className="rounded-lg py-3 text-sm cursor-pointer">
                                                    Mới nhất
                                                </DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="popular" className="rounded-lg py-3 text-sm cursor-pointer">
                                                    Thịnh hành
                                                </DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="oldest" className="rounded-lg py-3 text-sm cursor-pointer">
                                                    Cũ nhất
                                                </DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <button
                                        onClick={fetchNews}
                                        className="h-12 w-12 flex items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 hover:text-[#002855] hover:bg-slate-100 transition-all"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="container px-4 mx-auto pb-24">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="animate-pulse flex flex-col gap-6">
                                    <div className="aspect-[16/10] bg-muted rounded-[32px]" />
                                    <div className="space-y-3 px-2">
                                        <div className="h-4 w-1/4 bg-muted rounded-full" />
                                        <div className="h-8 w-full bg-muted rounded-xl" />
                                        <div className="h-4 w-full bg-muted rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredAndSortedNews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {filteredAndSortedNews.map((item) => (
                                <NewsCard key={item._id} news={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center flex flex-col items-center gap-8 bg-muted/5 rounded-[48px] border-2 border-dashed border-border/40">
                            <div className="w-32 h-32 rounded-full bg-muted/20 flex items-center justify-center relative">
                                <Search className="w-12 h-12 text-muted-foreground/30" />
                                <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">0</div>
                            </div>
                            <div className="max-w-md">
                                <h3 className="text-2xl font-bold mb-3 text-slate-900">Không tìm thấy kết quả</h3>
                                <p className="text-slate-500 text-base">
                                    Thử thay đổi từ khóa hoặc bộ lọc để tìm được nội dung mong muốn.
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                className="h-14 px-8 rounded-2xl font-bold"
                                onClick={() => {
                                    setSearchQuery("")
                                    setCategory("Tất cả")
                                }}
                            >
                                Xóa tất cả bộ lọc
                            </Button>
                        </div>
                    )}

                    {/* Load More - Refined */}
                    {filteredAndSortedNews.length >= 20 && !loading && (
                        <div className="mt-20 text-center">
                            <button className="h-14 px-12 rounded-full border border-slate-200 text-[12px] font-bold text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all uppercase tracking-widest bg-white shadow-xl shadow-slate-200/50">
                                XEM THÊM BÀI VIẾT
                                <ArrowRight className="inline-block ml-3 w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Professional Partners Section - Harmonious & Soft */}
                <div className="bg-slate-50 py-24 md:py-28 overflow-hidden relative border-t border-slate-100">
                    <div className="container px-4 mx-auto relative z-10">
                        <div className="flex flex-col items-center gap-4 mb-20">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40 bg-primary/5 px-6 py-2 rounded-full">Global Partners</span>
                            <h3 className="text-2xl md:text-3xl font-bold text-center tracking-tight text-primary">Đối tác chiến lược toàn cầu</h3>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { name: "VietnamWorks", desc: "Cổng thông tin tuyển dụng" },
                                { name: "World Bank Group", desc: "Nghiên cứu kinh tế vĩ mô" },
                                { name: "TopCV Vietnam", desc: "Nền tảng công nghệ nhân sự" },
                                { name: "GDU Research", desc: "Đơn vị nghiên cứu chuyên sâu" },
                                { name: "ITviec", desc: "Việc làm IT chuyên nghiệp" },
                                { name: "LinkedIn Learning", desc: "Nâng cao kỹ năng sự nghiệp" },
                                { name: "Navigos Search", desc: "Tuyển dụng cấp quản lý" },
                                { name: "GDU Placement", desc: "Trung tâm hỗ trợ việc làm" }
                            ].map((s) => (
                                <div key={s.name} className="bg-white p-8 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center text-center group hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500">
                                    <div className="mb-6 p-4 rounded-2xl bg-slate-50 group-hover:bg-primary/5 transition-colors">
                                        <Newspaper className="w-5 h-5 text-primary/30 group-hover:text-primary transition-colors" />
                                    </div>
                                    <span className="text-md font-bold text-primary transition-colors">{s.name}</span>
                                    <span className="text-[9px] uppercase font-bold text-slate-300 mt-2 tracking-widest">{s.desc}</span>
                                </div>
                            ))}
                        </div>

                        {/* Clean & Premium CTA Section */}
                        <div className="mt-28 max-w-5xl mx-auto p-12 md:p-16 rounded-[48px] bg-primary text-white relative overflow-hidden shadow-2xl shadow-primary/20 group">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-60 transition-all duration-1000" />
                            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 justify-between">
                                <div className="space-y-6 max-w-xl text-center lg:text-left">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-white/40 font-bold text-[10px] uppercase tracking-widest">
                                        Contributor Program
                                    </div>
                                    <h4 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">Cộng tác cùng <br /> đội ngũ chuyên gia</h4>
                                    <p className="text-white/40 text-[15px] font-normal leading-relaxed">Gửi bài phân tích của bạn để chia sẻ kiến thức hữu ích tới cộng đồng 5,000+ sinh viên GDU hàng tuần.</p>
                                </div>
                                <Button className="h-14 px-10 rounded-2xl bg-white text-primary font-bold text-sm uppercase tracking-widest hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 md:min-w-[240px]">
                                    Gửi bài phân tích
                                    <ArrowUpRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
