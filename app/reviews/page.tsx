import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SocialChatWidget } from "@/components/chat/social-chat-widget"
import { ReviewsClient } from "@/components/reviews/reviews-client"

export default function ReviewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/30 to-background">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">Đánh giá GDU</h1>
            <p className="text-lg text-primary-foreground/90">
              Chia sẻ và đọc đánh giá về trải nghiệm học tập và cơ hội việc làm tại GDU
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <ReviewsClient />
        </div>
      </main>
      <Footer />
      <SocialChatWidget />
    </div>
  )
}
