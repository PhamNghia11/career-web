"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { News } from "@/types"
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
import { CategorySection } from "@/components/news/category-section"

const CATEGORIES = [
    "Tất cả",
    "Thị trường",
    "Công nghệ",
    "Việc làm",
    "Kỹ năng",
    "Cẩm nang",
    "Định hướng",
    "Góc nhìn",
    "Thông báo"
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

    // States for specialized categories
    const [partnerNews, setPartnerNews] = useState<News[]>([])
    const [careerHackNews, setCareerHackNews] = useState<News[]>([])
    const [opportunityNews, setOpportunityNews] = useState<News[]>([])

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

    const fetchSpecializedNews = async () => {
        try {
            // Fetch Partner News (Market category)
            const pRes = await fetch(`/api/news?limit=10&category=Thị trường`)
            const pData = await pRes.json()
            if (pData.success && pData.data.length > 0) {
                setPartnerNews(pData.data)
            } else {
                // Fallback to latest news if empty
                const pFallback = await fetch(`/api/news?limit=10`)
                const pfData = await pFallback.json()
                if (pfData.success) setPartnerNews(pfData.data)
            }

            // Fetch Career Hacks & Talk (Skills category)
            const cRes = await fetch(`/api/news?limit=10&category=Kỹ năng`)
            const cData = await cRes.json()
            if (cData.success && cData.data.length > 0) {
                setCareerHackNews(cData.data)
            } else {
                const cFallback = await fetch(`/api/news?limit=10`)
                const cfData = await cFallback.json()
                if (cfData.success) setCareerHackNews(cfData.data)
            }

            // Fetch Internships & Contests (Notifications category)
            const oRes = await fetch(`/api/news?limit=10&category=Thông báo`)
            const oData = await oRes.json()
            if (oData.success && oData.data.length > 0) {
                setOpportunityNews(oData.data)
            } else {
                const oFallback = await fetch(`/api/news?limit=10`)
                const ofData = await oFallback.json()
                if (ofData.success) setOpportunityNews(ofData.data)
            }
        } catch (error) {
            console.error("Error fetching specialized news:", error)
        }
    }

    useEffect(() => {
        fetchNews()
        fetchSpecializedNews()
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
                            {/* Consolidated Topics - Full Width & Softened Style */}
                            <div className="flex flex-nowrap items-center w-full overflow-x-auto [&::-webkit-scrollbar]:hidden -ms-overflow-style:none [scrollbar-width:none] gap-3 pb-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-6 py-3 rounded-full text-[15px] font-bold transition-all duration-300 whitespace-nowrap border ${category === cat
                                            ? "bg-[#002855] text-white border-[#002855] shadow-lg shadow-[#002855]/20"
                                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-2">
                                <div className="relative group max-w-2xl flex-1">
                                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                    <input
                                        placeholder="Tìm kiếm nội dung bài viết..."
                                        className="w-full pl-9 pr-4 py-3 bg-transparent border-b border-slate-200 focus:border-primary focus:outline-none text-sm transition-all placeholder:text-slate-500 font-medium"
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

                {/* Professional Sections Replacement */}
                <div className="space-y-0">
                    <CategorySection
                        title="Góc Đối Tác"
                        description="Tin tức, báo cáo và cơ hội từ các đối tác chiến lược của GDU."
                        news={partnerNews}
                        viewAllHref="/news?category=Thị trường"
                    />

                    <CategorySection
                        title="Cẩm Nang Bứt Phá"
                        description="Bí kíp săn job, rèn luyện kỹ năng và câu chuyện từ những người đi trước."
                        news={careerHackNews}
                        viewAllHref="/news?category=Kỹ năng"
                    />

                    <CategorySection
                        title="Trạm Cơ Hội"
                        description="Học bổng, cuộc thi và các chương trình thực tập hấp dẫn dành riêng cho sinh viên."
                        news={opportunityNews}
                        viewAllHref="/news?category=Thông báo"
                    />
                </div>
            </main>

            <Footer />
        </div>
    )
}
