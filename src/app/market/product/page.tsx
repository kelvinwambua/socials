
"use client"

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Textarea } from "~/components/ui/textarea"
import { MapPin, MessageCircle, Heart, Share, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Zoom } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/zoom'

type Product = {
  id: string
  title: string
  price: number
  image: string
  timestamp:string
  description: string
  category: string
  author: {
    name: string
    avatar: string
    university: string
  }
}

const mockProduct: Product = {
  id: '1',
  title: 'Vintage Leather Backpack',
  price: 79.99,
  images: [
    'https://utfs.io/f/NZEym2bBuewNBmYWSmTnNaVrYpkMWJxHmRBE3uK8IiPcZ4QL',
    // Add more image URLs
  ],
  description: 'Handcrafted leather backpack, perfect for carrying your books and laptop. Stylish and durable.',
  location: 'Downtown Campus',
  category: 'Accessories',
  condition: 'Like New',
  seller: {
    name: 'Alex Chen',
    avatar: '/avatars/alex.jpg',
    university: 'Urban University',
    rating: 4.8
  }
}

export default function ProductDetails() {
  const router = useRouter()
  const { productId } = useParams()
  const [product] = useState(mockProduct)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [message, setMessage] = useState('')

  const handleSendMessage = () => {
    console.log('Sending message:', message)
    setIsMessageDialogOpen(false)
    setMessage('')
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-slate-400 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Marketplace
        </Button>

        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative h-96 md:h-full">
                <Swiper
                  modules={[Navigation, Pagination, Zoom]}
                  navigation
                  pagination={{ clickable: true }}
                  zoom={{ maxRatio: 3 }}
                  className="h-full"
                >
                  {product.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="swiper-zoom-container">
                        <Image
                          src={image}
                          alt={`${product.title} - Image ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4 text-white">{product.title}</h1>
                <p className="text-4xl font-bold text-red-500 mb-4">${product.price.toFixed(2)}</p>
                <div className="flex items-center text-slate-400 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{product.location}</span>
                </div>
                <Tabs defaultValue="description" className="mb-6">
                  <TabsList className="bg-slate-800">
                    <TabsTrigger value="description" className="text-white data-[state=active]:bg-red-600">Description</TabsTrigger>
                    <TabsTrigger value="details" className="text-white data-[state=active]:bg-red-600">Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="text-slate-300 mt-4">
                    {product.description}
                  </TabsContent>
                  <TabsContent value="details" className="text-slate-300 mt-4">
                    <p><strong>Category:</strong> {product.category}</p>
                    <p><strong>Condition:</strong> {product.condition}</p>
                  </TabsContent>
                </Tabs>
                <div className="flex items-center mb-6 bg-slate-800 p-4 rounded-lg">
                  <Image
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    width={64}
                    height={64}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{product.seller.name}</h3>
                    <p className="text-sm text-slate-400">{product.seller.university}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-slate-400">{product.seller.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700 text-white flex-grow">
                        <MessageCircle className="mr-2 h-5 w-5" /> Message Seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800">
                    <DialogHeader>
                      <DialogTitle className="text-white">Message Seller</DialogTitle>
                    </DialogHeader>
                    <Textarea
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-slate-800 text-white border-slate-700 mb-4"
                    />
                    <Button onClick={handleSendMessage} className="bg-red-600 hover:bg-red-700 text-white">
                      Send Message
                    </Button>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
                  <Heart className="mr-2 h-5 w-5" /> Save
                </Button>
                <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
                  <Share className="mr-2 h-5 w-5" /> Share
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Similar Items Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-white">Similar Items</h2>
        <Swiper
          slidesPerView={1}
          spaceBetween={16}
          navigation
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="similar-items-swiper"
        >
          {/* Add similar items here */}
          {[1, 2, 3, 4, 5].map((item) => (
            <SwiperSlide key={item}>
              <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48">
                    <Image
                      src={`/placeholder-item-${item}.jpg`}
                      alt={`Similar Item ${item}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Similar Item {item}</h3>
                    <p className="text-red-500 font-bold">$59.99</p>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Reviews Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-white">Reviews</h2>
        <div className="space-y-6">
          {[1, 2, 3].map((review) => (
            <Card key={review} className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <Image
                    src={`/avatar-${review}.jpg`}
                    alt={`Reviewer ${review}`}
                    width={40}
                    height={40}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-white">Reviewer {review}</h4>
                    <div className="flex items-center">
                    {Array.from({length: 5}).map((_, i) => (
  <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-500' : 'text-slate-600'}`} />
))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-300">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button className="mt-6 bg-slate-800 hover:bg-slate-700 text-white">
          View All Reviews
        </Button>
      </section>

      {/* FAQ Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
        <Tabs defaultValue="shipping" className="mb-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="shipping" className="text-white data-[state=active]:bg-red-600">Shipping</TabsTrigger>
            <TabsTrigger value="returns" className="text-white data-[state=active]:bg-red-600">Returns</TabsTrigger>
            <TabsTrigger value="condition" className="text-white data-[state=active]:bg-red-600">Condition</TabsTrigger>
          </TabsList>
          <TabsContent value="shipping" className="text-slate-300 mt-4">
            <p>We offer free shipping on all orders over $50. For orders under $50, a flat rate of $5 is applied.</p>
          </TabsContent>
          <TabsContent value="returns" className="text-slate-300 mt-4">
            <p>Returns are accepted within 14 days of delivery. The item must be in its original condition.</p>
          </TabsContent>
          <TabsContent value="condition" className="text-slate-300 mt-4">
            <p>All items are thoroughly inspected before listing. Any imperfections are noted in the product description.</p>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  </div>
  )
}