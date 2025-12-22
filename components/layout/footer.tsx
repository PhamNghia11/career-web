import Link from "next/link"
import { Facebook, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#1e3a5f] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="mb-6">
              <img
                src="/gdu-footer-logo.png"
                alt="Gia Dinh University"
                className="h-40 w-auto"
              />
            </div>
            <p className="text-primary-foreground/80 text-base leading-relaxed">
              Cổng thông tin việc làm dành cho sinh viên Đại học Gia Định. Kết nối sinh viên với các cơ hội nghề nghiệp
              phù hợp.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Liên kết nhanh</h4>
            <ul className="space-y-3 text-base">
              <li>
                <Link href="/jobs" className="hover:text-secondary transition-colors">
                  Tìm việc làm
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-secondary transition-colors">
                  Doanh nghiệp
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-secondary transition-colors">
                  Đánh giá GDU
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-secondary transition-colors">
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Liên hệ</h4>
            <ul className="space-y-4 text-base">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>371 Nguyen Kiem, Go Vap, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <a href="tel:1800599920" className="hover:text-secondary transition-colors">
                  1800 599 920
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <a href="mailto:tuyendung@gdu.edu.vn" className="hover:text-secondary transition-colors">
                  tuyendung@gdu.edu.vn
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold text-lg mb-4">Kết nối</h4>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/TruongDaihocGiaDinh"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 hover:bg-secondary p-3 rounded-full transition-colors"
                title="Trung tâm Trải nghiệm & Việc làm GDU"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://zalo.me/0961121018"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 hover:bg-secondary p-3 rounded-full transition-colors flex items-center justify-center"
                title="Nhắn tin Zalo"
              >
                <span className="font-bold text-xs">Zalo</span>
              </a>
            </div>
            <p className="text-base text-primary-foreground/60 mt-4">
              Theo dõi chúng tôi để cập nhật thông tin việc làm mới nhất.
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6">
          <div className="bg-secondary/20 rounded-lg p-6 mb-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
              <div className="flex items-center gap-3">
                <div className="bg-secondary p-3 rounded-full">
                  <Phone className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-primary-foreground/80 mb-1">Hotline tư vấn</p>
                  <a href="tel:1800599920" className="text-2xl font-bold hover:text-secondary transition-colors">
                    1800 599 920
                  </a>
                </div>
              </div>
              <div className="hidden md:block h-12 w-px bg-primary-foreground/20"></div>
              <div className="flex items-center gap-3">
                <div className="bg-secondary p-3 rounded-full">
                  <Mail className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-primary-foreground/80 mb-1">Email liên hệ</p>
                  <a
                    href="mailto:tuyendung@gdu.edu.vn"
                    className="text-xl font-bold hover:text-secondary transition-colors"
                  >
                    tuyendung@gdu.edu.vn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-primary-foreground/60 pt-4">
          <p>&copy; 2025 Gia Dinh University. All rights reserved. <Link href="/admin" className="opacity-0 hover:opacity-100 transition-opacity ml-2">Admin</Link></p>
        </div>
      </div>
    </footer>
  )
}
