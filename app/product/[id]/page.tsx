"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, ChevronLeft } from "lucide-react"
import { products } from "../../data"
import Link from "next/link"

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)
  const product = products.find((p) => p.id.toString() === params.id)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Không tìm thấy sản phẩm</h1>
        <Link href="/" className="text-orange-500 hover:text-orange-600 mt-4 inline-block">
          Quay lại trang chủ
        </Link>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-gray-600 hover:text-orange-500 mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Quay lại trang chủ
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
            <Badge className="absolute top-4 left-4 bg-orange-500 text-white">
              {product.badge}
            </Badge>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="relative h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-80">
                <Image
                  src={product.image}
                  alt={`${product.name} - ${index}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">({product.reviews} đánh giá)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-orange-500">{formatPrice(product.price)}</span>
              <span className="text-xl text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
            </div>
            <p className="text-green-600">Tiết kiệm: {formatPrice(product.originalPrice - product.price)}</p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Mô tả sản phẩm:</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Thông tin sản phẩm:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Xuất xứ: Việt Nam</li>
                <li>• Thương hiệu: Hải Anh Grocery</li>
                <li>• Trọng lượng: {product.weight}</li>
                <li>• Hạn sử dụng: 12 tháng</li>
                <li>• Bảo quản: Nơi khô ráo, thoáng mát</li>
              </ul>
            </div>

            {/* <div>
              <h3 className="font-semibold mb-2">Số lượng:</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10"
                  >
                    +
                  </Button>
                </div>
                <span className="text-gray-600">Còn lại: {product.stock} sản phẩm</span>
              </div>
            </div> */}

            <div className="flex space-x-4 pt-4">
              <Button  onClick={() => window.open('https://zalo.me/0984433566', '_blank')} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12">
                Mua ngay
              </Button>
              {/* <Button className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 h-12">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ
              </Button> */}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 4)
            .map((relatedProduct) => (
              <Link href={`/product/${relatedProduct.id}`} key={relatedProduct.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48">
                    <Image
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                      {relatedProduct.badge}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-500 font-bold">{formatPrice(relatedProduct.price)}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm ml-1">{relatedProduct.rating}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
} 