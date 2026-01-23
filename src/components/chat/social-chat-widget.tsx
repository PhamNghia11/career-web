"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SocialChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  // Direct links - click to open immediately
  const handleZaloClick = () => {
    window.open("https://zalo.me/0796079423", "_blank")
    setIsOpen(false)
  }

  const handleMessengerClick = () => {
    window.open("https://m.me/GDUStudentCenter", "_blank")
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-2xl animate-in slide-in-from-bottom-5">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Hỗ trợ trực tuyến</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Chọn kênh liên hệ phù hợp với bạn:</p>

              {/* Zalo Button */}
              <button
                onClick={handleZaloClick}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="bg-[#0068FF] text-white p-2 rounded-full flex items-center justify-center">
                  <span className="font-bold text-xs">Zalo</span>
                </div>
                <div className="text-left">
                  <div className="font-medium">Zalo</div>
                  <div className="text-xs text-muted-foreground">Chat nhanh qua Zalo</div>
                </div>
              </button>

              {/* Messenger Button */}
              <button
                onClick={handleMessengerClick}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-full">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Facebook Messenger</div>
                  <div className="text-xs text-muted-foreground">Chat qua Messenger</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
