import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SocialChatWidget } from "@/components/chat/social-chat-widget"
import { JobsListClient } from "@/components/jobs/jobs-list-client"

export default function JobsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/50 via-background to-muted/30">
      <Header />
      <main className="flex-1">
        <div className="bg-[#1e3a5f] py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white tracking-tight">
              Tìm kiếm cơ hội nghề nghiệp
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Khám phá hàng ngàn việc làm hấp dẫn từ các doanh nghiệp hàng đầu dành cho sinh viên GDU
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <JobsListClient />
        </div>
      </main>
      <Footer />
      <SocialChatWidget />
    </div>
  )
}
