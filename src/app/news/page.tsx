"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { News } from "@/types"
import { NewsCard } from "@/components/home/news-card"
import { TrendingUp, Search, Filter, Newspaper, ArrowRight, ArrowUpRight, ExternalLink, RefreshCw, ArrowLeft, Mail, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
import Link from "next/link"
import { CategorySection } from "@/components/news/category-section"
import { HeroGrid } from "@/components/news/hero-grid"
import { NewsSidebar } from "@/components/news/news-sidebar"
import { BannerQuote } from "@/components/news/banner-quote"
import { VideoSection } from "@/components/news/video-section"

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
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        }>
            <NewsPageContent />
        </Suspense>
    )
}

function NewsPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const urlCategory = searchParams.get("category")

    const [news, setNews] = useState<News[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [category, setCategory] = useState(urlCategory || "Tất cả")
    const [sortBy, setSortBy] = useState("newest")

    // States for specialized categories
    const [partnerNews, setPartnerNews] = useState<News[]>([])
    const [careerHackNews, setCareerHackNews] = useState<News[]>([])
    const [opportunityNews, setOpportunityNews] = useState<News[]>([])
    const [quoteNews, setQuoteNews] = useState<News | null>(null)
    const [videoNews, setVideoNews] = useState<News[]>([])

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

            // Fetch Quote
            const qRes = await fetch(`/api/news?limit=1&category=Quote`)
            const qData = await qRes.json()
            if (qData.success && qData.data.length > 0) {
                setQuoteNews(qData.data[0])
            }

            // Fetch Videos
            const vRes = await fetch(`/api/news?limit=3&category=Video`)
            const vData = await vRes.json()
            if (vData.success && vData.data.length > 0) {
                setVideoNews(vData.data)
            }
        } catch (error) {
            console.error("Error fetching specialized news:", error)
        }
    }

    useEffect(() => {
        fetchNews()
        fetchSpecializedNews()
    }, [category])

    // Sync with URL category
    useEffect(() => {
        if (urlCategory && urlCategory !== category) {
            setCategory(urlCategory)

            // Smooth scroll to results when category changes via URL
            setTimeout(() => {
                const element = document.getElementById('results-section');
                if (element) {
                    const headerOffset = 180;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [urlCategory])

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
        <div className="bg-white min-h-screen">
            <Header />

            <main>
                {/* Blue Hero Header */}
                <div className="relative py-16 md:py-24 lg:py-28 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/hero-bg.png')" }}
                    />
                    <div className="absolute inset-0 bg-primary/95 lg:bg-primary/90" />

                    <div className="container px-4 mx-auto relative z-10">
                        <div className="max-w-4xl">
                            <span className="inline-block px-4 py-1 bg-white/10 text-white text-[10px] font-bold rounded-full uppercase tracking-[0.3em] mb-6 border border-white/10">
                                GDU NEWSROOM
                            </span>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
                                Tin tức & <br />Xu hướng
                            </h1>
                            <p className="text-lg md:text-xl text-white/60 max-w-2xl font-medium leading-relaxed">
                                Cập nhật những chuyển động mới nhất về thị trường việc làm,
                                công nghệ và những câu chuyện thành công từ cộng đồng GDU.
                            </p>
                        </div>
                    </div>
                </div>

                {/* News Hero Grid Section */}
                <div className="bg-white">
                    {news.length > 0 && <HeroGrid featuredNews={news.slice(0, 3)} />}
                </div>

                {/* News Search & Filter Section */}
                <div className="bg-white border-y border-slate-100 sticky top-[112px] lg:top-[128px] z-40 backdrop-blur-md bg-white/90">
                    <div className="container px-4 mx-auto py-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                            {/* Categories */}
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 scrollbar-hide">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-6 py-2.5 rounded-full text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest ${category === cat
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                            : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Search & Sort */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm kiếm tin tức..."
                                        className="pl-12 h-12 rounded-xl border-slate-100 bg-slate-50 focus:ring-primary focus:border-primary font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="h-12 px-6 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all font-black text-xs uppercase tracking-widest">
                                                <Filter className="w-4 h-4" />
                                                {sortBy === "newest" ? "Mới nhất" : sortBy === "oldest" ? "Cũ nhất" : "Xem nhiều"}
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[200px] rounded-2xl p-2">
                                            <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-4 py-3">Sắp xếp theo</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                                                <DropdownMenuRadioItem value="newest" className="rounded-xl cursor-not-allowed cursor-pointer focus:bg-slate-50 py-3 font-bold text-slate-600">Đăng gần nhất</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="oldest" className="rounded-xl cursor-pointer focus:bg-slate-50 py-3 font-bold text-slate-600">Đăng xa nhất</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="popular" className="rounded-xl cursor-pointer focus:bg-slate-50 py-3 font-bold text-slate-600">Nhiều lượt xem nhất</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <button
                                        onClick={() => {
                                            setCategory("Tất cả")
                                            setSearchQuery("")
                                            fetchNews()
                                        }}
                                        className="h-12 w-12 flex items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 hover:text-[#002855] hover:bg-slate-100 transition-all"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container px-4 mx-auto pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Content Area */}
                        <div className="lg:col-span-8 min-h-[800px]">
                            <div id="results-section" className="flex items-center justify-between mb-10 border-b border-slate-100 pb-4 scroll-mt-48">
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">Bài viết mới nhất</h2>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="animate-pulse flex flex-col gap-6">
                                            <div className="aspect-[16/10] bg-slate-100 rounded-[32px]" />
                                            <div className="space-y-4">
                                                <div className="h-4 bg-slate-100 rounded w-1/4" />
                                                <div className="h-8 bg-slate-100 rounded w-full" />
                                                <div className="h-20 bg-slate-100 rounded w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredAndSortedNews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                                    {filteredAndSortedNews.map((item) => (
                                        <NewsCard key={item._id} news={item} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 text-center bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">Không tìm thấy bài viết nào.</p>
                                </div>
                            )}

                            {/* Load More */}
                            {filteredAndSortedNews.length >= 10 && (
                                <div className="mt-16 text-center">
                                    <button
                                        onClick={() => fetchNews()}
                                        className="h-14 px-12 rounded-full border border-slate-200 text-[11px] font-black text-slate-500 hover:bg-primary hover:text-white transition-all uppercase tracking-[0.2em] bg-white"
                                    >
                                        XEM THÊM BÀI VIẾT
                                        <ArrowRight className="inline-block ml-3 w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Area */}
                        <div className="lg:col-span-4">
                            <NewsSidebar onTagClick={(tag) => {
                                setSearchQuery(tag);
                                // Use a slightly longer timeout to allow for DOM settles
                                setTimeout(() => {
                                    const element = document.getElementById('results-section');
                                    if (element) {
                                        const headerOffset = 180; // Buffer for sticky header
                                        const elementPosition = element.getBoundingClientRect().top;
                                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                                        window.scrollTo({
                                            top: offsetPosition,
                                            behavior: 'smooth'
                                        });
                                    }
                                }, 300);
                            }} />
                        </div>
                    </div>
                </div>

                {/* Premium Banner Quote Section */}
                <BannerQuote news={quoteNews || undefined} />

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

                {/* Video Media Section fixed to bottom */}
                <VideoSection news={videoNews} />
            </main>

            <Footer />
        </div>
    )
}
