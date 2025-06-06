import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rượu Quê Truyền Thống - Hương vị đậm đà Việt Nam",
  description:
    "Khám phá và mua sắm rượu quê truyền thống chất lượng cao từ các vùng miền Việt Nam. Giao hàng toàn quốc, cam kết chính hãng.",
  keywords: "rượu quê, rượu truyền thống, rượu cần, rượu nếp cẩm, rượu sim, rượu việt nam",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
