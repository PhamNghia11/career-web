"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    title: "Tìm việc làm phù hợp cho sinh viên GDU",
    subtitle: "Kết nối sinh viên với hàng ngàn cơ hội việc làm từ các doanh nghiệp uy tín",
    image: "/students-working-together-university.jpg",
    cta: "Khám phá ngay",
    link: "/jobs",
  },
  {
    title: "Thực tập sinh - Bước đệm sự nghiệp",
    subtitle: "Hơn 500+ vị trí thực tập tại các công ty hàng đầu đang chờ bạn",
    image: "/internship-program-students-learning.jpg",
    cta: "Xem vị trí thực tập",
    link: "/jobs?type=internship",
  },
  {
    title: "Hội chợ việc làm GDU 2025",
    subtitle: "Sự kiện kết nối sinh viên với 100+ doanh nghiệp - Đăng ký ngay!",
    image: "/job-fair-event-with-students-and-employers.jpg",
    cta: "Đăng ký tham gia",
    link: "/contact",
  },
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent((current - 1 + slides.length) % slides.length)
  const next = () => setCurrent((current + 1) % slides.length)

  return (
    <section className="relative h-[60vh] lg:h-[70vh] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}>
            <div className="absolute inset-0 bg-primary/70" />
          </div>
          <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight text-balance">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">{slide.subtitle}</p>
              <Button
                onClick={() => router.push(slide.link)}
                className="bg-[#0077B6] hover:bg-[#0077B6]/90 text-white font-semibold text-lg px-8 py-6"
              >
                {slide.cta}
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-colors ${index === current ? "bg-[#0077B6]" : "bg-white/50"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
