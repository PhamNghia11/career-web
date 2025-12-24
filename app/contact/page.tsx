import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SocialChatWidget } from "@/components/chat/social-chat-widget"
import { ContactForm } from "@/components/contact/contact-form"
import { MapPin, Mail, Clock, MessageCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/30 to-background">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">Liên hệ với chúng tôi</h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh bên dưới.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Địa chỉ</h3>
                    <p className="text-muted-foreground">371 Nguyễn Kiệm, Phường 3, Quận Gò Vấp, TP.HCM</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-blue-500/20">
                <a
                  href="https://www.facebook.com/messages/t/TruongDaihocGiaDinh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:opacity-80 transition-opacity"
                >
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg shrink-0">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Messenger</h3>
                    <p className="text-muted-foreground">Chat trực tiếp qua Facebook</p>
                    <p className="text-primary font-medium">Nhắn tin ngay →</p>
                  </div>
                </a>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-[#0068FF]/10 to-[#0068FF]/5 border-[#0068FF]/20">
                <a
                  href="https://zalo.me/0961121018"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 hover:opacity-80 transition-opacity"
                >
                  <div className="p-3 bg-[#0068FF]/20 rounded-lg shrink-0 flex items-center justify-center">
                    <span className="font-bold text-[#0068FF]">Zalo</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Zalo</h3>
                    <p className="text-muted-foreground">Chat nhanh qua Zalo</p>
                    <p className="text-primary font-medium">Nhắn tin ngay →</p>
                  </div>
                </a>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Email</h3>
                    <p className="text-muted-foreground">tuyendung@gdu.edu.vn</p>
                    <p className="text-muted-foreground">ctsv@gdu.edu.vn</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg shrink-0">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Giờ làm việc</h3>
                    <p className="text-muted-foreground">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                    <p className="text-muted-foreground">Thứ 7: 8:00 - 12:00</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 shadow-lg bg-card">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Gửi tin nhắn cho chúng tôi</h2>
                <ContactForm />
              </Card>
            </div>
          </div>

          {/* Map */}
          <Card className="mt-8 overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.8587435831793!2d106.68427931533468!3d10.822158761307583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528bf37160855%3A0x9fa6f0c23e7d!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBHaWEgxJDhu4luaA!5e0!3m2!1svi!2s!4v1653045678901!5m2!1svi!2s"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        </div>
      </main>
      <Footer />
      <SocialChatWidget />
    </div>
  )
}
