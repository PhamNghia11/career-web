"use client"

import { useEffect, useState } from "react"
import { News } from "@/lib/types"
import { NewsCard } from "./news-card"
import { Button } from "@/components/ui/button"
import { ChevronRight, TrendingUp, Sparkles } from "lucide-react"

export function MarketTrends() {
    const [news, setNews] = useState<News[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch("/api/news?limit=3")
                const result = await response.json()
                if (result.success) {
                    setNews(result.data)
                }
            } catch (error) {
                console.error("Error fetching market trends:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchNews()
    }, [])

    if (loading) {
        return (
            <section className="py-20 bg-muted/30">
                <div className="container px-4 mx-auto">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 w-32 bg-muted rounded mb-4" />
                        <div className="h-8 w-64 bg-muted rounded mb-12" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[400px] bg-muted rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (news.length === 0) return null

    return (
        <section className="py-20 bg-muted/30 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            <TrendingUp className="w-4 h-4" />
                            <span>Thống kê & Dự báo</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                            Xu hướng & <span className="text-primary italic">Tin thị trường</span> việc làm
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Thông tin phân tích, dự báo tuyển dụng được tổng hợp tự động từ các nguồn uy tín như VietnamWorks, TopCV, World Bank... giúp sinh viên đón đầu xu hướng nghề nghiệp.
                        </p>
                    </div>
                    <Button variant="outline" className="group hidden md:flex">
                        Xem tất cả tin tức
                        <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {news.map((item) => (
                        <NewsCard key={item._id} news={item} />
                    ))}
                </div>

                <div className="mt-12 flex justify-center md:hidden">
                    <Button variant="outline" className="w-full group">
                        Xem tất cả tin tức
                        <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                <div className="mt-16 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Bạn muốn nhận tin tức mới nhất?</h4>
                            <p className="text-muted-foreground text-sm">Đăng ký bản tin để không bỏ lỡ những phân tích thị trường quan trọng.</p>
                        </div>
                    </div>
                    <div className="flex w-full md:w-auto gap-3">
                        <input
                            type="email"
                            placeholder="Email của bạn..."
                            className="flex-grow md:w-64 px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                        />
                        <Button>Đăng ký</Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
