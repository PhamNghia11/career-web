"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSlide {
  _id: string
  title: string
  subtitle: string
  image: string
  cta: string
  link: string
}

export function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch("/api/hero-slides?page=home")
        const data = await res.json()

        const defaultSlides: HeroSlide[] = [
          {
            _id: "default-1",
            title: "Tìm việc làm phù hợp cho sinh viên GDU",
            subtitle: "Kết nối sinh viên với hàng ngàn cơ hội việc làm từ các doanh nghiệp uy tín",
            image: "/students-working-together-university.jpg",
            cta: "Khám phá ngay",
            link: "/jobs",
          },
          {
            _id: "default-2",
            title: "Thực tập sinh - Bước đệm sự nghiệp",
            subtitle: "Hơn 500+ vị trí thực tập tại các công ty hàng đầu đang chờ bạn",
            image: "/internship-program-students-learning.jpg",
            cta: "Xem vị trí thực tập",
            link: "/internships",
          },
          {
            _id: "default-3",
            title: "Hội chợ việc làm GDU 2025",
            subtitle: "Sự kiện kết nối sinh viên với 100+ doanh nghiệp - Đăng ký ngay!",
            image: "/job-fair-event-with-students-and-employers.jpg",
            cta: "Đăng ký tham gia",
            link: "/contact",
          },
        ]

        if (data.success && data.data.length > 0) {
          // Merge logic: Map DB slides to their intended positions, or fill in gaps
          const dbSlides = data.data as HeroSlide[]
          // We'll create a 3-slot array and fill it. 
          // If DB has a slide at order 0, it replaces default 0.
          const merged = [...defaultSlides]
          dbSlides.forEach(s => {
            const order = (s as any).order ?? 0
            if (order >= 0 && order < 3) {
              merged[order] = { ...s, _id: s._id?.toString() || `db-${order}` }
            } else if (order >= 3) {
              // Add extra slides if order is > 2
              merged.push({ ...s, _id: s._id?.toString() || `db-${order}` })
            }
          })
          setSlides(merged)
        } else {
          setSlides(defaultSlides)
        }
      } catch (error) {
        console.error("Failed to fetch slides", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSlides()
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const prev = () => setCurrent((current - 1 + slides.length) % slides.length)
  const next = () => setCurrent((current + 1) % slides.length)

  if (loading) {
    return <section className="h-[60vh] lg:h-[70vh] bg-slate-100 animate-pulse" />
  }

  if (slides.length === 0) return null

  return (
    <section className="relative min-h-[80vh] lg:min-h-[85vh] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${slide.image})` }}>
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="relative h-full min-h-[80vh] lg:min-h-[85vh] container mx-auto px-4 flex flex-col justify-start pt-44 lg:pt-64">
            <div className="max-w-3xl">
              {/* Title with fixed height space for 2-3 lines */}
              <div className="min-h-[120px] md:min-h-[180px] flex items-end mb-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight text-balance drop-shadow-lg">
                  {slide.title || "\u00A0"}
                </h1>
              </div>

              {/* Subtitle with fixed height space for 2 lines */}
              <div className="min-h-[50px] md:min-h-[70px] flex items-start mb-8">
                <p className="text-lg md:text-xl text-white drop-shadow-md font-medium opacity-95">
                  {slide.subtitle || "\u00A0"}
                </p>
              </div>

              <Button
                onClick={() => router.push(slide.link)}
                className="bg-[#0077B6] hover:bg-[#0077B6]/90 text-white font-bold text-lg px-10 h-[64px] rounded-xl shadow-xl transition-all hover:scale-105 min-w-[260px] w-fit"
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
