import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SocialChatWidget } from "@/components/chat/social-chat-widget"
import { CompaniesListClient } from "@/components/companies/companies-list-client"

export default function CompaniesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/30 to-background">
      <Header />
      <main className="flex-1">
        <div className="relative py-20 overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero-bg.png')" }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-primary/85" />

          {/* Content */}
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-white">Khám phá doanh nghiệp</h1>
            <p className="text-lg text-white/90">
              Tìm hiểu về các công ty hàng đầu và cơ hội nghề nghiệp dành cho bạn
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <CompaniesListClient />
        </div>
      </main>
      <Footer />
      <SocialChatWidget />
    </div>
  )
}
