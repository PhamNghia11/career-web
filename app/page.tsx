import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedJobs } from "@/components/home/featured-jobs"
import { MajorsSection } from "@/components/home/majors-section"
import { StatsSection } from "@/components/home/stats-section"
import { PartnersSection } from "@/components/home/partners-section"
import { SocialChatWidget } from "@/components/chat/social-chat-widget"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/50 via-background to-muted/30">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <div className="mt-12">
          <FeaturedJobs />
        </div>
        <MajorsSection />
        <StatsSection />
        <PartnersSection />
      </main>
      <Footer />
      <SocialChatWidget />
    </div>
  )
}
