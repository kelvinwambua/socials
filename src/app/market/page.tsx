"use client"

import { useState, useEffect, useCallback } from 'react'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Slider } from "~/components/ui/slider"
import { Search, MapPin, Heart, Share, Grid, List, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { api } from "~/utils/api"
import { useDebounce } from '~/hooks/use-debounce'
import { Skeleton } from "~/components/ui/skeleton"
import { useToast } from "~/components/ui/use-toast"
import type { RouterOutputs } from "~/utils/api"

type Product = RouterOutputs["marketplace"]["getProducts"][0]

const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Other']

export default function Marketplace() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const debouncedSearch = useDebounce(searchTerm, 500)
  const { ref, inView } = useInView({
    threshold: 0,
  })

  // Get products query with infinite loading
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = api.marketplace.getProducts.useInfiniteQuery(
    {
      limit: 12,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      search: debouncedSearch,
      sortBy: 'recent'
    },
    {
      getNextPageParam: (lastPage) => {
        if (lastPage?.length === 0) return undefined
        return lastPage[lastPage.length - 1]?.product.id
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      }
    }
  )

  const products = data?.pages.flatMap((page) => page) ?? []

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const filteredProducts = products.filter(
    product => product.product.price >= priceRange[0] && product.product.price <= priceRange[1]
  )

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/marketplace/${product.product.id}`}>
        <Card className="overflow-hidden bg-slate-900 border-slate-800 hover:border-slate-700 transition-all duration-300">
          <CardContent className="p-0">
            <div className="relative h-48 md:h-64">
              <Image
                src={product.product.image}
                alt={product.product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                loading="lazy"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button variant="ghost" size="icon" className="bg-slate-800/50 hover:bg-slate-800">
                  <Heart className="h-4 w-4 text-red-500" />
                </Button>
                <Button variant="ghost" size="icon" className="bg-slate-800/50 hover:bg-slate-800">
                  <Share className="h-4 w-4 text-blue-500" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{product.product.title}</h3>
            <p className="text-2xl font-bold text-red-500 mb-2">${product.product.price.toFixed(2)}</p>
            <div className="flex items-center text-slate-400 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{product.product.category}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Image
                  src={product.seller.image ?? '/default-avatar.png'}
                  alt={product.seller.name ?? 'Seller'}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
                <span className="text-sm text-slate-400">{product.seller.name}</span>
              </div>
              <span className="text-xs text-slate-500">{product.product.category}</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )

  const ProductSkeleton = () => (
    <Card className="overflow-hidden bg-slate-900 border-slate-800">
      <CardContent className="p-0">
        <Skeleton className="h-48 md:h-64 w-full" />
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-red-600">Sonder Marketplace</h1>
        
        <div className="flex flex-col md:flex-row mb-8 space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-grow">
            <Input
              type="search"
              placeholder="Search for items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 text-white border-slate-700 focus:border-red-600 focus:ring-red-600"
            />
          </div>
          <Select onValueChange={(value) => setSelectedCategory(value)}>
            <SelectTrigger className="w-full md:w-[180px] bg-slate-800 text-white border-slate-700">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 text-white border-slate-700">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm text-slate-400 mb-2">Price Range: ${priceRange[0]} - ${priceRange[1]}</p>
          <Slider
            defaultValue={[0, 1000]}
            max={1000}
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
            className="w-full"
          />
        </div>

        <Tabs defaultValue="recent" className="mb-8">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="recent" className="text-white data-[state=active]:bg-red-600">Recent</TabsTrigger>
            <TabsTrigger value="price_asc" className="text-white data-[state=active]:bg-red-600">Price: Low to High</TabsTrigger>
            <TabsTrigger value="price_desc" className="text-white data-[state=active]:bg-red-600">Price: High to Low</TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <div className="text-center text-red-500 mb-8">
            Failed to load products. Please try again.
          </div>
        )}

        <AnimatePresence>
          <motion.div 
            className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
          >
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.product.id} product={product} />
              ))
            )}
          </motion.div>
        </AnimatePresence>
        
        {isFetchingNextPage && (
          <div className="flex justify-center mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        )}

        <div ref={ref} className="h-10" />
      </div>
    </div>
  )
}