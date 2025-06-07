"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  Star,
  Search,
  User,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ArrowUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import Link from "next/link"
import { createOrder } from '@/lib/orderService'
import { products } from "./data"

const categories = [
  {
    id: 1,
    name: "Bột Sắn",
    image: "/bot-san-01.png",
    description: "Bột sắn nguyên chất, không chất bảo quản",
  },
  {
    id: 2,
    name: "Bột Nghệ",
    image: "/bot-nghe.png",
    description: "Bột nghệ tươi xay mịn, giữ nguyên dưỡng chất",
  },
  {
    id: 3,
    name: "Nem Nắm",
    image: "/nem-nam.png",
    description: "Nem nắm truyền thống, thơm ngon đậm đà",
  },
]



const testimonials = [
  {
    id: 1,
    name: "Nguyễn Văn Huy",
    avatar: "/placeholder.svg?height=50&width=50",
    comment: "Sản phẩm rất chất lượng, đóng gói cẩn thận. Nem nắm thơm ngon như ở quê làm, sẽ ủng hộ shop dài dài.",
    rating: 5,
  },
  {
    id: 2,
    name: "Trần Thị Hồng",
    avatar: "/placeholder.svg?height=50&width=50",
    comment: "Bột sắn rất mịn và trắng, làm bánh rất ngon. Giao hàng nhanh, sẽ mua lại.",
    rating: 5,
  },
  {
    id: 3,
    name: "Lê Văn Nghị",
    avatar: "/placeholder.svg?height=50&width=50",
    comment: "Bột nghệ thơm, màu đẹp. Đã mua nhiều lần và luôn hài lòng với chất lượng.",
    rating: 4,
  },
]

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  unit: string
}

interface OrderData {
  customerName: string
  phone: string
  email?: string
  address: string
  note?: string
  items: {
    productId: string
    name: string
    price: number
    quantity: number
  }[]
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  orderDate?: string
  orderId?: string
}

export default function HomePage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  })
  const [buyNowMode, setBuyNowMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const featuredProductsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    // Simulate loading time and hide loading screen
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // 2 seconds loading time

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          unit: product.unit,
        },
      ]
    })
  }

  const handleBuyNow = (product: any) => {
    // Clear cart and add only this product
    setCart([
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        unit: product.unit,
      },
    ])
    setBuyNowMode(true)
    setShowOrderForm(true)
  }

  const updateQuantity = (id: number, change: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.id === id) {
              const newQuantity = Math.max(0, item.quantity + change)
              return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
            }
            return item
          })
          .filter(Boolean) as CartItem[],
    )
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const generateOrderId = () => {
    return "DH" + Date.now().toString().slice(-8)
  }

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        customerName: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        items: cart.map(item => ({
          productId: item.id.toString(),
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: getTotalPrice(),
        status: 'pending' as const
      };
      await createOrder(orderData);
      
      setOrderData({
        ...orderData,
        email: customerInfo.email,
        note: customerInfo.note,
        orderDate: new Date().toISOString(),
        orderId: generateOrderId()
      });

      setCart([]);
      setCustomerInfo({
        name: "",
        phone: "",
        email: "",
        address: "",
        note: "",
      });
      setShowOrderForm(false);
      setBuyNowMode(false);
    } catch (error) {
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setScrollPosition(scrollLeft)
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" })
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      handleScroll() // Check initial state
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleCloseOrderForm = () => {
    setShowOrderForm(false)
    if (buyNowMode) {
      setCart([])
      setBuyNowMode(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-white flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Sản Phẩm Quê Nhà</h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 mt-4"
            >
              Đang tải sản phẩm tươi ngon...
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="h-1 bg-orange-500 rounded-full mt-4 max-w-xs mx-auto"
            />
          </div>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5, delay: isLoading ? 0 : 0.3 }}
      >
        {/* Promo Banner */}
        <div className="bg-orange-500 text-white py-2 px-4 text-center">
          <div className="container mx-auto flex items-center justify-center">
            <p className="text-sm md:text-base font-medium">
              SIÊU SALE THÁNG 6!
            </p>
            {/* <Button
              size="sm"
              variant="outline"
              className="ml-4 text-green-600 border-white hover:bg-white hover:text-orange-500 hidden md:flex"
            >
              Nhận voucher
            </Button> */}
          </div>
        </div>

        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-20 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Hải Anh Shop</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Sản Phẩm Quê Nhà</h1>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="#" className="text-gray-700 hover:text-orange-500 font-medium">
                  Sản phẩm
                </Link>
                <Link href="#" className="text-gray-700 hover:text-orange-500 font-medium">
                  Liên hệ
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-700">
                  <Search className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-700">
                  <User className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 relative"
                  onClick={() => setShowCart(true)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">{getTotalItems()}</Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <section className="relative bg-gradient-to-r from-orange-50 to-yellow-50 py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
                    Sản phẩm truyền thống <span className="text-orange-500">từ quê nhà</span>
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Bột sắn, bột nghệ, nem nắm - Sạch, ngon, đậm đà hương vị quê hương. Được sản xuất theo phương pháp
                    truyền thống, không chất bảo quản.
                  </p>
                  <div className="flex space-x-4">
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2"
                      onClick={() => handleBuyNow(products[0])}
                    >
                      Mua ngay
                    </Button>
                    <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                      Tìm hiểu thêm
                    </Button>
                  </div>
                </motion.div>
              </div>
              <div className="md:w-1/2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative"
                >
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <Image
                      src="/bot-san.png"
                      alt="Sản phẩm quê nhà"
                      width={600}
                      height={400}
                      className="rounded-lg object-cover"
                    />
                    <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white py-2 px-4 rounded-lg shadow-lg">
                      <p className="text-sm font-bold">Giảm giá 10K</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-2 text-gray-800">Danh mục nổi bật</h3>
              <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Link href="#" className="block">
                    <div className="bg-orange-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="relative h-64">
                        <Image
                          src={category.image || "/placeholder.svg"}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-orange-500 transition-colors">
                          {category.name}
                        </h4>
                        <p className="text-gray-600 mb-4">{category.description}</p>
                        <div className="flex items-center text-orange-500">
                          <span className="font-medium">Xem sản phẩm</span>
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-gray-50" ref={featuredProductsRef}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-2 text-gray-800">Sản phẩm bán chạy</h3>
              <div className="w-24 h-1 bg-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Những sản phẩm được khách hàng yêu thích và đánh giá cao nhất
              </p>
            </div>

            <div className="relative">
              {/* Navigation Buttons */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className={`bg-white shadow-lg hover:bg-orange-50 border-orange-200 ${
                    !canScrollLeft ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className={`bg-white shadow-lg hover:bg-orange-50 border-orange-200 ${
                    !canScrollRight ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Scrollable Products Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-12"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group flex-shrink-0 w-72"
                  >
                    <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white h-full">
                      <div className="relative">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-4 left-4 bg-orange-500 text-white">{product.badge}</Badge>
                        <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{product.rating}</span>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                        <h4 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-orange-500 transition-colors">
                          {product.name}
                        </h4>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xl font-bold text-orange-500">{formatPrice(product.price)}</span>
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {formatPrice(product.originalPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="text-sm text-gray-600">
                            Đã bán: {product.reviews * 3} | Còn lại: {product.stock}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() => handleBuyNow(product)}
                          >
                            Mua ngay
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50"
                            onClick={() => addToCart(product)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Thêm vào giỏ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Scroll Indicator */}
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {products.slice(0, Math.min(6, products.length)).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        Math.floor(scrollPosition / 300) === index ? "bg-orange-500 w-6" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                Xem tất cả sản phẩm
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-2 text-gray-800">Tại sao chọn chúng tôi?</h3>
              <div className="w-24 h-1 bg-orange-500 mx-auto mb-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🌱",
                  title: "100% Tự Nhiên",
                  description: "Sản phẩm được chế biến hoàn toàn tự nhiên, không chất bảo quản",
                },
                {
                  icon: "🚚",
                  title: "Giao Hàng Tận Nơi",
                  description: "Giao hàng nhanh chóng toàn quốc, đóng gói cẩn thận",
                },
                {
                  icon: "💯",
                  title: "Chất Lượng Đảm Bảo",
                  description: "Cam kết chất lượng, hoàn tiền 100% nếu không hài lòng",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ y: -5 }}
                  className="text-center p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-orange-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-2 text-gray-800">Khách hàng nói gì về chúng tôi</h3>
              <div className="w-24 h-1 bg-orange-500 mx-auto mb-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-2 text-gray-800">Liên hệ với chúng tôi</h3>
              <div className="w-24 h-1 bg-orange-500 mx-auto mb-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Phone,
                  title: "Điện thoại",
                  info: "0984 433 566",
                  description: "Hotline hỗ trợ 24/7",
                },
                {
                  icon: Mail,
                  title: "Email",
                  info: "doanvanhuy268@gmail.com",
                  description: "Phản hồi trong 2h",
                },
                {
                  icon: MapPin,
                  title: "Địa chỉ",
                  info: "Số 1, Ngõ 36 Thịnh Quang, Đống Đa, Hà Nội",
                  description: "Cửa hàng chính",
                },
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ y: -5 }}
                  className="text-center p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <contact.icon className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <h4 className="text-xl font-bold mb-2 text-gray-800">{contact.title}</h4>
                  <p className="text-lg font-semibold text-orange-500 mb-1">{contact.info}</p>
                  <p className="text-gray-600 text-sm">{contact.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Cart Dialog */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Giỏ hàng của bạn</DialogTitle>
            </DialogHeader>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Giỏ hàng trống</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-orange-500 font-bold">
                        {formatPrice(item.price)}/{item.unit}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-orange-500">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => setShowOrderForm(true)}
                  >
                    Đặt hàng ngay
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Order Form Dialog */}
        <Dialog open={showOrderForm} onOpenChange={handleCloseOrderForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{buyNowMode ? "Đặt hàng ngay" : "Thông tin đặt hàng"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {buyNowMode && cart.length > 0 && (
                <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Sản phẩm đã chọn:</h4>
                  <div className="flex items-center space-x-3">
                    <Image
                      src={cart[0].image || "/placeholder.svg"}
                      alt={cart[0].name}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{cart[0].name}</p>
                      <p className="text-orange-500 font-bold">
                        {formatPrice(cart[0].price)} x {cart[0].quantity}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="name">Họ và tên *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="Nhập email"
                />
              </div>

              <div>
                <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                <Textarea
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  placeholder="Nhập địa chỉ chi tiết"
                />
              </div>

              <div>
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  value={customerInfo.note}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                  placeholder="Ghi chú thêm (nếu có)"
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Tổng tiền:</span>
                  <span className="font-bold text-orange-500">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleCreateOrder}
                disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address}
              >
                Xác nhận đặt hàng
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Order Success Dialog */}
        {orderData && (
          <Dialog open={!!orderData} onOpenChange={() => setOrderData(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-orange-500">Đặt hàng thành công!</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-gray-600">Cảm ơn bạn đã đặt hàng!</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Mã đơn hàng:</span>
                    <span className="font-bold text-orange-500">{orderData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Khách hàng:</span>
                    <span>{orderData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số điện thoại:</span>
                    <span>{orderData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng tiền:</span>
                    <span className="font-bold text-orange-500">{formatPrice(orderData.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời gian:</span>
                    <span>{orderData.orderDate}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>• Chúng tôi sẽ liên hệ với bạn trong vòng 30 phút</p>
                  <p>• Thời gian giao hàng: 1-2 ngày làm việc</p>
                  <p>• Thanh toán khi nhận hàng (COD)</p>
                </div>

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setOrderData(null)}
                >
                  Đóng
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Scroll to Top Button and Zalo Button Container */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center space-y-3">
          <motion.a
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            href="https://zalo.me/0984433566"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-300 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl flex items-center justify-center"
          >
            <Image src="/zalo.png" alt="Zalo" width={30} height={30}/>
          </motion.a>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <ArrowUp className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <h4 className="text-xl font-bold">Sản Phẩm Quê Nhà</h4>
                </div>
                <p className="text-gray-400">
                  Mang đến những sản phẩm tự nhiên, sạch, chất lượng cao từ quê hương Việt Nam.
                </p>
                <div className="flex space-x-4 mt-4">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </Button>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Sản phẩm</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-orange-400 transition-colors">
                      Bột sắn nguyên chất
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-orange-400 transition-colors">
                      Bột nghệ tươi
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-orange-400 transition-colors">
                      Nem nắm truyền thống
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-orange-400 transition-colors">
                      Combo tiết kiệm
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Hỗ trợ</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-orange-400 transition-colors">
                      Chính sách đổi trả
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-orange-400 transition-colors">
                      Hướng dẫn đặt hàng
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-orange-400 transition-colors">
                      Câu hỏi thường gặp
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-orange-400 transition-colors">
                      Liên hệ
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Đăng ký nhận tin</h4>
                <p className="text-gray-400 mb-4">Nhận thông tin khuyến mãi và sản phẩm mới</p>
                <div className="flex">
                  <Input
                    placeholder="Email của bạn"
                    className="bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                  />
                  <Button className="ml-2 bg-orange-500 hover:bg-orange-600 text-white">Đăng ký</Button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Sản Phẩm Quê Nhà. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </footer>
      </motion.div>
    </>
  )
}
