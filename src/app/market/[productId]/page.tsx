'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Heart, Share2, ShoppingCart, MessageCircle } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Skeleton } from "../../../components/ui/skeleton"
import { useToast } from "../../../hooks/use-toast"
import { api } from "../../../trpc/react"
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

const ProductPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const productId = typeof params.productId === 'string' ? parseInt(params.productId) : undefined

  const [isImageLoading, setIsImageLoading] = useState(true)

  const { data: productData, isLoading: isProductLoading } = api.product.getProductById.useQuery(
    { productId: productId! },
    { enabled: !!productId }
  )

  const { data: similarProducts, isLoading: isSimilarLoading } = api.product.getSimilarProducts.useQuery(
    {
      category: productData?.product.category ?? '',
      currentProductId: productId!,
      limit: 4
    },
    { enabled: !!productData }
  )
  const createConversationMutation = api.chat.createConversation.useMutation({
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not start conversation with seller.",
        variant: "destructive",
      })
    }
  })
  
  const handleContactSeller = () => {
    if (!productData?.seller.id) {
      toast({
        title: "Error",
        description: "Seller information not available.",
        variant: "destructive",
      })
      return
    }
  
    createConversationMutation.mutate({
      participantId: productData.seller.id
    })
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Product link has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy the link.",
        variant: "destructive",
      })
    }
  }

  if (isProductLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg bg-gray-800" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 bg-gray-800" />
              <Skeleton className="h-6 w-1/4 bg-gray-800" />
              <Skeleton className="h-24 w-full bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
          <Button onClick={() => router.push('/market')} variant="outline">
            Return to Marketplace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative">
            <div className="aspect-square relative rounded-lg overflow-hidden">
              {isImageLoading && (
                <Skeleton className="absolute inset-0 bg-gray-800" />
              )}
              <Image
                src={productData.product.image}
                alt={productData.product.title}
                fill
                className="object-cover"
                onLoadingComplete={() => setIsImageLoading(false)}
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={100}
                priority
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-2 bg-red-600 hover:bg-red-700">
                {productData.product.category}
              </Badge>
              <h1 className="text-3xl font-bold">{productData.product.title}</h1>
              <p className="text-4xl font-bold text-red-500 mt-2">
                ${productData.product.price.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={productData.seller.image ?? "https://github.com/shadcn.png"} />
              <AvatarFallback>{productData.seller.name??"CN".charAt(0)}</AvatarFallback>
            </Avatar>

              <div>
                <p className="font-semibold">{productData.seller.name}</p>
                <p className="text-sm text-gray-400">
                  Posted {new Date(productData.product.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-gray-300">{productData.product.description}</p>

            <div className="flex space-x-4">
              <Button className="flex-1 bg-red-600 hover:bg-red-700">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button variant="outline" className="bg-gray-800 hover:bg-gray-700">
                <Heart className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={handleShare} className="bg-gray-800 hover:bg-gray-700">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <Button 
  variant="outline" 
  className="w-full bg-gray-800 hover:bg-gray-700"
  onClick={handleContactSeller}
  disabled={createConversationMutation.isPending}
>
  <MessageCircle className="mr-2 h-4 w-4" />
  {createConversationMutation.isPending ? 'Starting chat...' : 'Contact Seller'}
</Button>
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isSimilarLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 bg-gray-800" />
              ))
            ) : (
              similarProducts?.map(({ product, seller }) => (
                <Link key={product.id} href={`/market/${product.id}`}>
                  <Card className="overflow-hidden bg-gray-800 border-gray-700 hover:border-red-500 transition-all">
                    <div className="relative aspect-square">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate">{product.title}</h3>
                      <p className="text-lg font-bold text-red-500">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage