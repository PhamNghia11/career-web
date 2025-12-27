"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SocialChatWidget } from "@/components/chat/social-chat-widget"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Target, Users, Zap } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden bg-[#0f172a] text-white">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6">Về Chúng Tôi</h1>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                            Cổng thông tin việc làm chính thức của Đại học Gia Định - Nơi kết nối tài năng sinh viên với cơ hội nghề nghiệp vững chắc.
                        </p>
                    </div>
                </section>

                {/* Introduction Section */}
                <section className="py-16 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <img
                                    src="/hero-bg.png"
                                    alt="Gia Dinh University"
                                    className="rounded-2xl shadow-2xl"
                                />
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-foreground">Kết nối nhân tài - Kiến tạo tương lai</h2>
                                <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                                    <p>
                                        Đại học Gia Định (GDU) luôn chú trọng đến việc định hướng và phát triển nghề nghiệp cho sinh viên.
                                        Cổng thông tin việc làm (GDU Career) được xây dựng với sứ mệnh trở thành cầu nối vững chắc giữa nhà trường, sinh viên và doanh nghiệp.
                                    </p>
                                    <p>
                                        Tại đây, sinh viên có thể dễ dàng tiếp cận hàng ngàn cơ hội việc làm, thực tập hấp dẫn từ mạng lưới đối tác doanh nghiệp uy tín của nhà trường.
                                        Đồng thời, doanh nghiệp cũng có thể tìm kiếm và tuyển dụng những ứng viên tài năng, năng động và sáng tạo từ GDU.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
                                        <Link href="/jobs">Tìm việc làm ngay</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision & Mission */}
                <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Tầm nhìn & Sứ mệnh</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Chúng tôi không ngừng nỗ lực để mang lại giá trị thiết thực nhất cho sinh viên và doanh nghiệp.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="p-8 border-none shadow-lg bg-background hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                                    <Target className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Tầm nhìn</h3>
                                <p className="text-muted-foreground">
                                    Trở thành nền tảng kết nối việc làm hàng đầu cho sinh viên, nơi khởi đầu vững chắc cho sự nghiệp thành công.
                                </p>
                            </Card>

                            <Card className="p-8 border-none shadow-lg bg-background hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                                    <Zap className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Sứ mệnh</h3>
                                <p className="text-muted-foreground">
                                    Đồng hành cùng sinh viên trên con đường phát triển sự nghiệp, cung cấp cơ hội việc làm đa dạng và chất lượng.
                                </p>
                            </Card>

                            <Card className="p-8 border-none shadow-lg bg-background hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Giá trị cốt lõi</h3>
                                <p className="text-muted-foreground">
                                    Kết nối thực chất - Cơ hội công bằng - Phát triển bền vững. Luôn lấy lợi ích của sinh viên làm trọng tâm.
                                </p>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Why Choose GDU Career */}
                <section className="py-16 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <h2 className="text-3xl font-bold mb-6">Tại sao nên chọn GDU Career?</h2>
                                <ul className="space-y-4">
                                    {[
                                        "Hàng ngàn việc làm được cập nhật liên tục mỗi ngày.",
                                        "Kết nối trực tiếp với các doanh nghiệp đối tác uy tín.",
                                        "Hỗ trợ tư vấn, định hướng nghề nghiệp miễn phí.",
                                        "Quy trình ứng tuyển đơn giản, nhanh chóng, tiện lợi.",
                                        "Cung cấp thông tin thị trường lao động chính xác."
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                                            <span className="text-lg text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="order-1 md:order-2">
                                <img
                                    src="https://giadinh.edu.vn/upload/img/news/1620.jpg"
                                    alt="Why Choose GDU"
                                    className="rounded-2xl shadow-2xl object-cover h-full min-h-[400px]"
                                    onError={(e) => {
                                        e.currentTarget.src = "/hero-bg.png"
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <SocialChatWidget />
        </div>
    )
}
